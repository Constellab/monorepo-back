import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnStory, HnStoryStatus} from './hn-story.entity';
import {Repository} from 'typeorm';
import {HnTopicService} from '../topic/hn-topic.service';
import {ClPage, ClStringHelper} from '@monorepo/core-lib';
import {BlAbstractPaginatedService, BlBucketConfig, BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {CmRichText, CmRichTextHeader, CmRichTextI, CmRichTextImageCP} from '@monorepo/common-model';
import imageSize from 'image-size';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {IncomingMessage} from 'http';
import {ISizeCalculationResult} from 'image-size/dist/types/interface';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';

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
              private configService: HnCoreConfigService
  ) {
  }

  async createStory(title: string): Promise<HnStory> {
    const story = new HnStory();
    story.title = title;
    story.content = CmRichText.newRichText();
    return this.storyRepository.save(story);
  }

  async getStory(id: string): Promise<HnStory> {
    return this.storyRepository.findOneBy({id: id});
  }

  async getMyStories(page: number, size: number): Promise<ClPage<HnStory>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: {
        createdBy: {
          id: HnCurrentUserHelper.getCurrentUser().id
        }
      },
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
      order: {createdAt: 'DESC' as any}
    }, this.storyRepository.manager, HnStory);
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
      order: {createdAt: 'DESC' as any}
    }, this.storyRepository.manager, HnStory);
  }

  async updateStoryTitle(id: string, title: string): Promise<HnStory> {
    const story = await this.getStory(id);
    story.title = title;
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
          this.getBucketConfig(), imgBlFile, true);
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
      storyImage.filename = await this.objectStorageService.uploadObject(this.getBucketConfig(), file, true);
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
    return this.storyRepository.save(story);
  }
}
