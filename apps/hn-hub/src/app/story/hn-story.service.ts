import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnStory, HnStoryCategory, HnStoryStatus} from './hn-story.entity';
import {FindOptionsOrder, FindOptionsWhere, In, Like, Repository} from 'typeorm';
import {HnTopicService} from '../topic/hn-topic.service';
import {ClPage, ClStringHelper} from '@monorepo/core-lib';
import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlBucketConfig,
  BlBucketType,
  BlFile,
  BlImageHelper,
  BlObjectStorageService,
  BlRichText,
  BlRichTextFigure,
  BlRichTextFigureOp,
  BlRichTextI,
  BlRichTextUploadedImage,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {IncomingMessage} from 'http';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnCreateStoryDto, HnStoryFilter} from './hn-story.dto';
import {HnTopicDto} from '../topic/hn-topic.dto';
import {HnTopic} from '../topic/hn-topic.entity';
import {DateTime} from 'luxon';
import {HnStoryAuthorService} from '../story-author/hn-story-author.service';
import {HnStoryAuthor, HnStoryAuthorStatus} from '../story-author/hn-story-author.entity';
import {HnStoryAuthorInvite} from '../story-author-invite/hn-story-author-invite.entity';
import {HnInviteStatus} from '../core/model/config/hn-invite-status.enum';
import {HnSiteMapEnumChangefreq, HnSitemapItemBase} from '../core/model/config/hn-site-map.class';
import {HnFrontService} from '../core/service/hn-front.service';
import {HnStoryFile} from '../story-file/hn-story-file.entity';
import {HnStoryFileService} from '../story-file/hn-story-file.service';


@Injectable()
export class HnStoryService {


  constructor(@InjectRepository(HnStory)
              private readonly storyRepository: Repository<HnStory>,
              private readonly topicService: HnTopicService,
              private objectStorageService: BlObjectStorageService,
              private configService: HnCoreConfigService,
              private frontService: HnFrontService,
              private storyAuthorService: HnStoryAuthorService,
              private storyFileService: HnStoryFileService
  ) {
  }

  async createStory(data: HnCreateStoryDto): Promise<HnStory> {
    const story = new HnStory();
    story.title = data.title;
    story.category = data.category;
    story.content = BlRichText.newRichText();

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
    return BlAbstractPaginatedService.findPaginatedStatic(page, size,
      {
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
    const order: FindOptionsOrder<HnStory> = {createdAt: 'DESC' as any};
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

  async checkAndValidateOwnerOrCoAuthor(id: string): Promise<void> {
    const isAuthor: boolean = await this.isStoryOwnerOrCoAuthor(id);
    if (!isAuthor) {
      throw new BlUnauthorizedException('You are not authorized to update this story');
    }
  }

  async updateStoryTitle(id: string, title: string): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const story = await this.getStory(id);
    story.title = title;
    return this.storyRepository.save(story);
  }

  async updateStoryCategory(id: string, category: HnStoryCategory): Promise<HnStory>{
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const story = await this.getStory(id);
    story.category = category;
    return this.storyRepository.save(story);
  }

  async addStoryTopic(id: string, topic: HnTopicDto): Promise<HnTopic> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const t: HnTopic = await this.topicService.getOrCreateTopic(topic);
    const story: HnStory = await this.getStory(id);
    story.topics.push(t);
    await this.storyRepository.save(story);
    t.popularityIndex++;
    return this.topicService.saveTopic(t);
  }

  async removeTopic(id: string, topicId: string): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const story = await this.getStory(id);
    story.topics = story.topics.filter(t => t.id !== topicId);
    const topic: HnTopic = await this.topicService.getTopic(topicId);
    if (topic.popularityIndex > 0) {
      topic.popularityIndex--;
      await this.topicService.saveTopic(topic);
    }
    return this.storyRepository.save(story);
  }

  async updateStoryContent(id: string, content: BlRichTextI): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const story = await this.getStory(id);
    story.content = content;
    const richText = new BlRichText(content);
    story.firstParagraph = ClStringHelper.replaceLineBreaksBySpace(richText.getFirstParagraph());
    story.mainPicture = richText.getFirstFigureLink();
    return this.storyRepository.save(story);
  }

  async saveImage(file: BlFile, storyId: string): Promise<BlRichTextUploadedImage> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId);
    const imSize = BlImageHelper.getImageSize(file);
    const fileExt = file.originalname.split('.').pop();
    file.originalname = storyId + '/images/' + ClStringHelper.generateUUID() + '.' + fileExt;
    const filename = await this.objectStorageService.uploadObject([this.getBucketConfig(), this.getBackupBucketConfig()], file,
      {generateRandomObjectName: false});

    return {
      filename: filename,
      width: imSize.width,
      height: imSize.height,
    };
  }


  async saveFile(file: BlFile, storyId: string): Promise<HnStoryFile> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId);

    const originalname = file.originalname;
    const ext = originalname.split('.').pop();
    file.originalname = storyId + '/files/' + ClStringHelper.generateUUID() + '.' + ext;
    const fileName: string = await this.objectStorageService.uploadObject([this.getBucketConfig(), this.getBackupBucketConfig()], file,
      {generateRandomObjectName: false});

    const story: HnStory = await this.getStory(storyId);

    const storyFile: HnStoryFile = new HnStoryFile();
    storyFile.initFile(story, originalname, fileName);

    return await this.storyFileService.saveStoryFile(storyFile);
  }

  async getStoryImage(fileName: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(this.getBucketConfig(), fileName);
  }

  async getStoryFile(storyFileId: string): Promise<IncomingMessage> {
    const storyFile: HnStoryFile = await this.storyFileService.getStoryFile(storyFileId);
    if (storyFile == null) {
      throw new BlBadRequestException('Document not found');
    }
    return await this.objectStorageService.getObject(this.getBucketConfig(), storyFile.fileName);
  }

  async getStoryFileName(storyFileId: string): Promise<string> {
    const storyFile: HnStoryFile = await this.storyFileService.getStoryFile(storyFileId);
    if (storyFile == null) {
      throw new BlBadRequestException('Document not found');
    }
    return storyFile.humanName;
  }

  async renameStoryFile(storyFileId: string, newFileName: string): Promise<HnStoryFile> {
    const storyFile: HnStoryFile = await this.storyFileService.getStoryFile(storyFileId);
    if (storyFile == null) {
      throw new BlBadRequestException('Document not found');
    }
    storyFile.humanName = newFileName;
    return await this.storyFileService.saveStoryFile(storyFile);
  }

  async deleteStoryFile(storyFileId: string): Promise<void> {
    const storyFile: HnStoryFile = await this.storyFileService.getStoryFile(storyFileId);
    if(await this.objectStorageService.deleteObjectIfExist([this.getBucketConfig(), this.getBackupBucketConfig()], storyFile.fileName)){
      await this.storyFileService.deleteStoryFile(storyFile);
    }
  }


  private getBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getDefaultObjectStorageEndPoint(),
      region: this.configService.getDefaultObjectStorageRegion(),
      bucket: this.configService.getStoryImageObjectStorageBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials(),
      bucketType: BlBucketType.NORMAL
    };
  }

  // TODO: A retirer après utilisation en prod
  async structureStoriesBucket(): Promise<void> {
    // check if user is admin for authorization
    if (!HnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) {
      throw new BlUnauthorizedException();
    }

    const stories: HnStory[] = await this.storyRepository.find();

    for (const story of stories) {
      // Change story content
      const richText: BlRichText = new BlRichText(story.content as BlRichTextI);
      const figures: BlRichTextFigure[] = richText.getFiguresOps().map((f: BlRichTextFigureOp) => f.insert.figure);
      for (const figure of figures) {
        if (figure.filename.includes(story.id + '/images/')  || ClStringHelper.isHttpLink(figure.filename)) continue;
        let newFilename = '';
        if(figure.filename.includes(story.id + '/')){
          newFilename = figure.filename.replace(story.id + '/', story.id + '/images/');
        } else {
          newFilename = story.id + '/images/' + figure.filename;
        }
        console.log('Copy ' + figure.filename + ' to ' + newFilename)
        await this.copyStoryImage(figure.filename, newFilename);
        await this.deleteStoryImage(figure.filename);
        await this.modifyStoryImageInContent(story, figure.filename, newFilename);
      }

      // Change story main picture
      if (story.mainPicture && story.mainPicture.length > 0 &&
        !story.mainPicture.includes(story.id + '/images/')  && !ClStringHelper.isHttpLink(story.mainPicture)) {
        story.mainPicture = story.id + '/images/' + story.mainPicture;
        await this.storyRepository.save(story);
      }
    }
  }

  async publishStory(id: string): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const story: HnStory = await this.getStory(id);
    if (new BlRichText(story.content as BlRichTextI).getFirstFigureLink().length <= 0) {
      throw new Error('Story must have a main picture');
    }
    story.status = HnStoryStatus.PUBLISHED;
    story.publishedAt = DateTime.now();
    return this.storyRepository.save(story);
  }

  async isStoryOwnerOrCoAuthor(id: string, onlyOwner: boolean = false): Promise<boolean> {
    const story = await this.getStory(id);
    return story.getAuthor().id === HnCurrentUserHelper.getCurrentUser().id ||
      story.storyAuthors.some((sA: HnStoryAuthor) =>
        sA.user.id === HnCurrentUserHelper.getCurrentUser().id && onlyOwner ?
          sA.status === HnStoryAuthorStatus.AUTHOR :
          (sA.status === HnStoryAuthorStatus.COAUTHOR || sA.status === HnStoryAuthorStatus.AUTHOR));
  }

  async updateStoryCoAuthors(id: string, newCoAuthorsMail: string[]): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const story: HnStory = await this.getStory(id);
    await this.storyAuthorService.updateStoryCoAuthors(story, newCoAuthorsMail);
    return this.storyRepository.save(story);
  }

  async getStoryCoAuthorsPendingInvites(id: string): Promise<HnStoryAuthorInvite[]> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    return this.storyAuthorService.getStoryCoAuthorsPendingInvites(id);
  }

  async removeStoryCoAuthor(id: string, storyAuthorUserId: string): Promise<void> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    return this.storyAuthorService.removeStoryCoAuthor(storyAuthorUserId);
  }

  async inviteStoryCoAuthor(storyId: string, coAuthorMail: string): Promise<boolean>{
    await this.checkAndValidateOwnerOrCoAuthor(storyId);
    const story: HnStory = await this.getStory(storyId);
    if (story == null)
      throw new BlBadRequestException('Story not found');
    return this.storyAuthorService.inviteStoryCoAuthor(story, coAuthorMail);
  }

  async isInviteValid(token: string): Promise<HnStoryAuthorInvite> {
    const storyAuthorInvite: HnStoryAuthorInvite = await this.storyAuthorService.getStoryAuthorInviteByToken(token);
    return (storyAuthorInvite && storyAuthorInvite.status === HnInviteStatus.PENDING &&
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

  async getAllStoriesMap(): Promise<HnSitemapItemBase[]> {
    const stories: HnStory[] = await this.storyRepository.find({where: {status: HnStoryStatus.PUBLISHED}});
    return stories.map((story: HnStory) => ({
      url: this.frontService.getStoryUrl(story.id, story.titlePath),
      priority: 0.8,
      changefreq: HnSiteMapEnumChangefreq.MONTHLY,
      lastmod: story.lastModifiedAt.toFormat('yyyy-MM-dd'),
    }));
  }

  async copyStoryImage(filename: string, newFilename?: string): Promise<void> {
    if (!newFilename) {
      newFilename = filename;
    }
    await this.objectStorageService.copyObjectIfExist(
      this.getBucketConfig(),
      this.getBucketConfig(),
      filename,
      newFilename
    );
    await this.objectStorageService.copyObjectIfExist(
      this.getBucketConfig(),
      this.getBackupBucketConfig(),
      newFilename,
    );
  }

  async deleteStoryImage(filename: string): Promise<void> {
    await this.objectStorageService.deleteObjectIfExist([this.getBucketConfig(), this.getBackupBucketConfig()], filename);
  }

  async modifyStoryImageInContent(story: HnStory, filename: string, newFilename: string): Promise<void> {
    story.content = BlRichText.modifyFigureInContent(story.content as BlRichTextI, filename, newFilename);
    await this.storyRepository.save(story);
  }

  private getBackupBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getBackupObjectStorageEndPoint(),
      region: this.configService.getBackupObjectStorageRegion(),
      bucket: this.configService.getStoryImageObjectStorageBackupBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials(),
      bucketType: BlBucketType.NORMAL
    };
  }


  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.storyAuthorService.deleteCoAuthorInvite(inviteId);
  }
}
