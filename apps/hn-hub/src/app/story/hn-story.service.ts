import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnStory, HnStoryStatus} from './hn-story.entity';
import {FindOptionsOrder, FindOptionsWhere, In, Like, Repository} from 'typeorm';
import {HnTopicService} from '../topic/hn-topic.service';
import {ClPage, ClStringHelper} from '@monorepo/core-lib';
import {BlAbstractPaginatedService, BlBucketConfig, BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {CmRichText, CmRichTextHeader, CmRichTextI, CmRichTextImageCP} from '@monorepo/common-model';
import imageSize from 'image-size';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {IncomingMessage} from 'http';
import {ISizeCalculationResult} from 'image-size/dist/types/interface';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnCreateStoryDto, HnStoryFilter} from './hn-story.dto';
import {HnTopicDto} from '../topic/hn-topic.dto';
import {HnTopic} from '../topic/hn-topic.entity';
import {DateTime} from 'luxon';
import {HnStoryAuthorService} from '../story-author/hn-story-author.service';
import {HnStoryAuthor, HnStoryAuthorStatus} from '../story-author/hn-story-author.entity';
import {HnStoryAuthorInvite, HnStoryAuthorInviteStatus} from '../story-author-invite/hn-story-author-invite.entity';

class HnStoryImage {
  filename: string;
  width: number;
  height: number;
}

@Injectable()
export class HnStoryService {


  constructor(@InjectRepository(HnStory)
              private readonly storyRepository: Repository<HnStory>,
              private readonly topicService: HnTopicService,
              private objectStorageService: BlObjectStorageService,
              private configService: HnCoreConfigService,

              private storyAuthorService: HnStoryAuthorService
  ) {
  }

  async createStory(data: HnCreateStoryDto): Promise<HnStory> {
    const story = new HnStory();
    story.title = data.title;
    story.category = data.category;
    story.content = CmRichText.newRichText();

    const dbStory: HnStory = await this.storyRepository.save(story);
    await this.storyAuthorService.createStoryAuthor(dbStory, HnCurrentUserHelper.getCurrentUser());
    return dbStory;
  }

  async getStory(id: string): Promise<HnStory> {
    return await this.storyRepository.findOne({
      where: {
        id: id
      },
      relations: ['topics']
    });
  }

  async getMyStories(page: number, size: number): Promise<ClPage<HnStory>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: [
        {
          storyAuthors: {
            user: {
              id: HnCurrentUserHelper.getCurrentUser().id
            },
            status: HnStoryAuthorStatus.AUTHOR
          }
        },
        {
          storyAuthors: {
            user: {
              id: HnCurrentUserHelper.getCurrentUser().id
            },
            status: HnStoryAuthorStatus.COAUTHOR
          }
        }
      ],
      relations: ['topics'],
      order: {
        createdAt: 'DESC' as any
      }
    },
    this.storyRepository.manager, HnStory
    );
  }

  async getStories(page: number, size: number): Promise<ClPage<HnStory>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: {
        status: HnStoryStatus.PUBLISHED
      },
      relations: ['topics'],
      order: {createdAt: 'DESC' as any}
    }, this.storyRepository.manager, HnStory);
  }

  async getStoriesByFilter(filters: HnStoryFilter, page: number, size: number): Promise<ClPage<HnStory>> {
    const where: FindOptionsWhere<HnStory> = {};
    const order: FindOptionsOrder<HnStory> = {createdAt:  'DESC' as any};
    if (filters.categories && filters.categories.length > 0) {
      where.category = In(filters.categories);
    }
    if (filters.topics && filters.topics.length > 0) {
      where.topics = {
        id: In(filters.topics)
      };
    }
    if (filters.title && filters.title.length > 0) {
      where.title = Like(`%${filters.title}%`);
    }

    where.status = HnStoryStatus.PUBLISHED;
    // TODO: Fix the research + order + relations
    return (await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: where,
      relations: ['topics'],
      order: order
    }, this.storyRepository.manager, HnStory));
  }

  async getStoriesByTopicId(topicId: string, page: number, size: number): Promise<ClPage<HnStory>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: [
        {
          topics: {
            id: topicId
          },
          status: HnStoryStatus.PUBLISHED
        }
      ],
      relations: ['topics'],
      order: {createdAt: 'DESC' as any}
    }, this.storyRepository.manager, HnStory);
  }

  async updateStoryTitle(id: string, title: string): Promise<HnStory> {
    const story = await this.getStory(id);
    story.title = title;
    return this.storyRepository.save(story);
  }

  async addStoryTopic(id: string, topic: HnTopicDto): Promise<HnTopic> {
    const t: HnTopic = await this.topicService.getOrCreateTopic(topic);
    const story: HnStory = await this.getStory(id);
    story.topics.push(t);
    await this.storyRepository.save(story);
    t.popularityIndex++;
    return this.topicService.saveTopic(t);
  }

  async removeTopic(id: string, topicId: string): Promise<HnStory> {
    const story = await this.getStory(id);
    story.topics = story.topics.filter(t => t.id !== topicId);
    const topic: HnTopic = await this.topicService.getTopic(topicId);
    if (topic.popularityIndex > 0) {
      topic.popularityIndex--;
      await this.topicService.saveTopic(topic);
    }
    return this.storyRepository.save(story);
  }

  async updateStoryContent(id: string, content: CmRichTextI): Promise<HnStory> {
    const story = await this.getStory(id);
    story.content = await this.editContent(content);
    const richText = new CmRichText(content);
    story.firstParagraph = ClStringHelper.replaceLineBreaksBySpace(richText.getFirstParagraph());
    story.mainPicture = richText.getFirstFigureLink();
    return this.storyRepository.save(story);
  }

  async editContent(content: CmRichTextI): Promise<CmRichTextI> {
    const headers: CmRichTextHeader[] = CmRichText.getHeaders(content);
    const listId: string[] = [];
    for (const h of headers) {
      if (h.attributes.header.id) {
        h.attributes.header.id = ClStringHelper.toIdForUrl(h.attributes.header.id);
        if (h.attributes.header.id.length > 0) {
          const sameTitleNumber: number = listId.filter(value => value == h.attributes.header.id).length;
          if (sameTitleNumber > 0) {
            h.attributes.header.id = h.attributes.header.id + sameTitleNumber;
          }
          listId.push(h.attributes.header.id);
        } else {
          delete h.attributes.header.id;
        }
      }
    }

    const imageCP: CmRichTextImageCP[] = CmRichText.getImageCP(content);

    for (const im of imageCP) {
      if ('image' in im.insert) {
        const base64Img: string = im.insert.image.split(',')[1];
        const imgBuffer: Buffer = new Buffer(base64Img, 'base64');
        const imgBlFile: BlFile = {
          buffer: imgBuffer,
          encoding: null,
          mimetype: 'image',
          size: null,
          originalname: 'any.png'
        };
        const imgSize: ISizeCalculationResult = imageSize(imgBuffer);
        const imgName: string = await this.objectStorageService.uploadObject(
          this.getBucketConfig(), imgBlFile, {generateRandomObjectName: true});
        im.insert = {
          figure: {
            filename: imgName,
            height: imgSize.height,
            width: imgSize.width,
            naturalWidth: imgSize.width,
            naturalHeight: imgSize.height
          }
        };
      }
    }
    return content;
  }

  async saveImage(files: BlFile[]): Promise<any> {
    const storyImage: HnStoryImage = new HnStoryImage();
    for (const file of files) {
      const imSize = imageSize(file.buffer);
      storyImage.filename = await this.objectStorageService.uploadObject(this.getBucketConfig(), file,
        {generateRandomObjectName: true});
      storyImage.width = imSize.width;
      storyImage.height = imSize.height;
    }
    return storyImage;
  }

  async getImage(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(this.getBucketConfig(), filename);
  }

  private getBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getDefaultObjectStorageEndPoint(),
      region: this.configService.getDefaultObjectStorageRegion(),
      bucket: this.configService.getStoryImageObjectStorageBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials()
    };
  }

  async publishStory(id: string): Promise<HnStory> {
    const story: HnStory = await this.getStory(id);
    if (new CmRichText(story.content as CmRichTextI).getFirstFigureLink().length <= 0) {
      throw new Error('Story must have a main picture');
    }
    story.status = HnStoryStatus.PUBLISHED;
    story.publishedAt = DateTime.now();
    return this.storyRepository.save(story);
  }

  async isStoryOwnerOrCoAuthor(id: string): Promise<boolean> {
    const story = await this.getStory(id);
    return story.getAuthor().id === HnCurrentUserHelper.getCurrentUser().id ||
      story.storyAuthors.some((sA: HnStoryAuthor) => sA.user.id === HnCurrentUserHelper.getCurrentUser().id &&
        (sA.status === HnStoryAuthorStatus.COAUTHOR || sA.status === HnStoryAuthorStatus.AUTHOR));
  }

  async updateStoryCoAuthors(id: string, newCoAuthorsMail: string[]): Promise<HnStory> {
    const story: HnStory = await this.getStory(id);
    await this.storyAuthorService.updateStoryCoAuthors(story, newCoAuthorsMail);
    return this.storyRepository.save(story);
  }

  async removeStoryCoAuthor(id: string, coAuthorId: string): Promise<void> {
    return this.storyAuthorService.removeStoryCoAuthor(id, coAuthorId);
  }

  async isInviteValid(token: string): Promise<HnStoryAuthorInvite> {
    const storyAuthorInvite: HnStoryAuthorInvite = await this.storyAuthorService.getStoryAuthorInviteByToken(token);
    return (storyAuthorInvite && storyAuthorInvite.status === HnStoryAuthorInviteStatus.PENDING &&
      storyAuthorInvite.email === HnCurrentUserHelper.getCurrentUser().email) ? storyAuthorInvite : null;
  }

  async acceptInvite(token: string): Promise<HnStory> {
    const storyAuthorInvite: HnStoryAuthorInvite = await this.isInviteValid(token);
    if (storyAuthorInvite) {
      const story: HnStory = await this.getStory(storyAuthorInvite.story.id);
      const storyAuthor: HnStoryAuthor = new HnStoryAuthor();
      storyAuthor.status = HnStoryAuthorStatus.COAUTHOR;
      storyAuthor.user = HnCurrentUserHelper.getCurrentUser();
      storyAuthor.story = story;
      const acceptStoryInvite: boolean = await this.storyAuthorService.acceptInvite(storyAuthor, storyAuthorInvite);
      return acceptStoryInvite ? story : null;
    }
    throw new Error('Invalid invite');
  }

}
