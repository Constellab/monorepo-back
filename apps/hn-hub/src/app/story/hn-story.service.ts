import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnStory, HnStoryCategory, HnStoryStatus } from './hn-story.entity';
import { DataSource, EntityManager, FindOptionsOrder, FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { HnTopicService } from '../topic/hn-topic.service';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlFile,
  BlNewRichText,
  BlRichTextContent,
  BlRichTextUploadedImageResponse,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnCreateStoryDto, HnStoryDto, HnStoryFilter } from './hn-story.dto';
import { HnTopicDto } from '../topic/hn-topic.dto';
import { HnTopic } from '../topic/hn-topic.entity';
import { DateTime } from 'luxon';
import { HnStoryAuthorService } from '../story-author/hn-story-author.service';
import { HnStoryCoAuthor } from '../story-author/hn-story-author.entity';
import { HnStoryCoAuthorInvite } from '../story-author-invite/hn-story-author-invite.entity';
import { HnInviteStatus } from '../core/model/config/hn-invite-status.enum';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnFileStoryService } from '../file-aggregate/file-story/hn-file-story.service';
import { HnUploadFileResponseDto } from '../file-aggregate/file-core/hn-abstract-file.dto';
import { HnFileStory } from '../file-aggregate/file-story/hn-file-story.entity';
import { HnFileType } from '../file-aggregate/file-core/hn-abstract-file.entity';
import { HnStoryFileService } from '../story-file/hn-story-file.service';


@Injectable()
export class HnStoryService {


  constructor(@InjectRepository(HnStory)
              private readonly storyRepository: Repository<HnStory>,
              private readonly topicService: HnTopicService,
              private frontService: HnFrontService,
              private storyAuthorService: HnStoryAuthorService,
              private storyFileService: HnFileStoryService,
              private oldStoryFileService: HnStoryFileService,
              private dataSource: DataSource
  ) {
  }

  async createStory(data: HnCreateStoryDto): Promise<HnStory> {
    const story = new HnStory();
    story.title = data.title;
    story.category = data.category;
    story.content = BlNewRichText.emptyContent();
    return await this.storyRepository.save(story);
  }

  async findById(id: string): Promise<HnStory> {
    return await this.storyRepository.findOneBy({id: id});
  }

  async getStoryTitle(id: string): Promise<string> {
    const story = await this.getStory(id);
    return story?.title;
  }

  async getStory(id: string, strict = true): Promise<HnStory> {
    const story = await this.storyRepository.findOne({
      where: {
        id: id
      },
      relations: ['topics']
    });
    if (story == null && strict) {
      throw new BlBadRequestException('Story not found');
    }
    return story;
  }

  async deleteStory(id: string): Promise<void> {
    await this.checkAndValidateOwnerOrCoAuthor(id, true);
    const deleteRes = await this.dataSource.transaction(async entityManager => {
      await this.storyFileService.deleteAllEntityFiles(id, entityManager);
      await this.deleteAllStoryCoAuthorsInvites(id, entityManager);
      await this.deleteAllStoryCoAuthors(id, entityManager);
      const res = await entityManager.delete(HnStory, {id: id});
      return res.affected > 0;
    });
    if (!deleteRes) {
      throw new BlBadRequestException('Error during the deletion, the story is not deleted');
    }
  }

  async deleteAllStoryCoAuthorsInvites(storyId: string, entityManager: EntityManager): Promise<void> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId, true);
    const storyCoAuthorsInvites = await this.storyAuthorService.getStoryCoAuthorsInvites(storyId);
    for (const storyCoAuthorsInvite of storyCoAuthorsInvites) {
      try {
        await entityManager.delete(HnStoryCoAuthorInvite, storyCoAuthorsInvite.id);
      } catch (e) {
        throw new BlBadRequestException('Error during the deletion of a story co-author invite');
      }
    }
  }

  async deleteAllStoryCoAuthors(storyId: string, entityManager: EntityManager): Promise<void> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId, true);
    const storyCoAuthors = await this.storyAuthorService.getStoryCoAuthorsByStoryId(storyId);
    for (const storyCoAuthor of storyCoAuthors) {
      try {
        await entityManager.delete(HnStoryCoAuthor, storyCoAuthor.id);
      } catch (e) {
        throw new BlBadRequestException('Error during the deletion of a story co-author');
      }
    }
  }

  async getMyStoriesFiltered(page: number, size: number, filters: HnStoryFilter): Promise<ClPage<HnStoryDto>> {
    const where: FindOptionsWhere<HnStory>[] = [
      {
        createdBy: {
          id: HnCurrentUserHelper.getCurrentUser().id
        }
      },
      {
        storyAuthors: {
          user: {
            id: HnCurrentUserHelper.getCurrentUser().id
          }
        }
      }];
    const order: FindOptionsOrder<HnStory> = {createdAt: 'DESC' as any};
    if (filters.categories && filters.categories.length > 0) {
      where.map(w => w.category = In(filters.categories));
    }

    if (filters.topics && filters.topics.length > 0) {
      where.map(w => w.topics = {
        id: In(filters.topics)
      });
    }

    if (filters.title && filters.title.length > 0) {
      where.map(w => w.title = Like(`%${filters.title}%`));
    }

    return (await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: where,
      relations: ['topics', 'storyAuthors'],
      order: order
    }, this.storyRepository.manager, HnStory)).map(story => {
      return new HnStoryDto(story)
    });
  }

  async getUserStories(userId: string, page: number, size: number): Promise<ClPage<HnStoryDto>>{
    return (await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: [{
        createdBy: {
          id: userId
        },
        status: HnStoryStatus.PUBLISHED
      },{
        storyAuthors: {
          user:{
            id: userId
          }
        },
        status: HnStoryStatus.PUBLISHED
      }],
      relations: ['topics'],
      order: {publishedAt: 'DESC' as any}
    }, this.storyRepository.manager, HnStory)).map(story => new HnStoryDto(story));
  }

  async getMyStories(page: number, size: number): Promise<ClPage<HnStoryDto>> {
    return (await BlAbstractPaginatedService.findPaginatedStatic(page, size,
      {
        where: [
          {
            createdBy: {
              id: HnCurrentUserHelper.getCurrentUser().id
            }
          },
          {
            storyAuthors: {
              user: {
                id: HnCurrentUserHelper.getCurrentUser().id
              }
            }
          }
        ],
        relations: ['topics'],
        order: {
          createdAt: 'DESC' as any
        }
      },
      this.storyRepository.manager, HnStory
    )).map(story => new HnStoryDto(story));
  }

  async getStoriesByFilter(filters: HnStoryFilter, page: number, size: number): Promise<ClPage<HnStoryDto>> {
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
    }, this.storyRepository.manager, HnStory)).map(story => new HnStoryDto(story));
  }

  async getStoriesByTopicId(topicId: string, page: number, size: number): Promise<ClPage<HnStoryDto>> {
    return (await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
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
    }, this.storyRepository.manager, HnStory)).map(story => new HnStoryDto(story));
  }

  async checkAndValidateOwnerOrCoAuthor(id: string, onlyOwner = false): Promise<void> {
    const isAuthor: boolean = await this.isStoryOwnerOrCoAuthor(id, onlyOwner);
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

  async updateStoryCategory(id: string, category: HnStoryCategory): Promise<HnStory> {
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

  async updateStoryContent(id: string): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const story = await this.getStory(id);
    const richText = new BlNewRichText(story.contentEdition as BlRichTextContent);
    if (story.mainPicture == null) {
      const firstFigureLink = richText.getFirstFigureLink();
      if (firstFigureLink == null)
        throw new BlBadRequestException('Story must have a main picture');
      story.mainPicture = firstFigureLink;
    }
    story.content = story.contentEdition;
    story.firstParagraph = ClStringHelper.replaceLineBreaksBySpace(richText.getFirstParagraphsText());
    return this.storyRepository.save(story);
  }

  async updateStoryContentEdition(id: string, contentEdition: BlRichTextContent): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const story = await this.getStory(id);
    story.contentEdition = contentEdition;
    const richText = new BlNewRichText(story.contentEdition as BlRichTextContent);
    const firstFigureLink = richText.getFirstFigureLink();
    if (story.mainPicture == null) {
      story.mainPicture = firstFigureLink;
    } else if (firstFigureLink != null && story.mainPicture !== firstFigureLink && richText.isUsedFigure(story.mainPicture)) {
      story.mainPicture = firstFigureLink;
    }
    return this.storyRepository.save(story);
  }

  async saveImage(file: BlFile, storyId: string): Promise<BlRichTextUploadedImageResponse> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId);
    const story: HnStory = await this.getStory(storyId);
    return this.storyFileService.saveImage(story, file);
  }

  async updateStoryMainImage(file: BlFile, storyId: string): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId);
    const story: HnStory = await this.getStory(storyId);
    const mainPictureData = await this.storyFileService.saveImage(story, file);
    story.mainPicture = mainPictureData.filename;
    return await this.storyRepository.save(story);
  }

  async deleteStoryMainImage(storyId: string): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId);
    const story: HnStory = await this.getStory(storyId);
    const content = new BlNewRichText(story.contentEdition as BlRichTextContent);
    if (content.getFirstFigureLink() == null && story.publishedAt != null)
      throw new BlBadRequestException('A published story must have a main picture. \n ' +
        'Add a picture to the story content before deleting the main picture');

    if (story.mainPicture == null)
      throw new BlBadRequestException('Main picture not found');
    await this.storyFileService.deleteFile(storyId, story.mainPicture);

    story.mainPicture = new BlNewRichText(story.contentEdition as BlRichTextContent).getFirstFigureLink();
    return await this.storyRepository.save(story);
  }


  async saveFile(file: BlFile, storyId: string): Promise<HnUploadFileResponseDto> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId);
    const story: HnStory = await this.getStory(storyId);
    return await this.storyFileService.saveFile(story, file);
  }

  async publishStory(id: string): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const story: HnStory = await this.updateStoryContent(id);
    if (story.mainPicture == null) {
      throw new Error('Story must have a main picture');
    }
    story.status = HnStoryStatus.PUBLISHED;
    story.publishedAt = DateTime.now();
    return this.storyRepository.save(story);
  }

  async isStoryOwnerOrCoAuthor(id: string, onlyOwner: boolean = false): Promise<boolean> {
    if (HnCurrentUserHelper.getCurrentUser() == null) return false;

    if (HnCurrentUserHelper.getCurrentUser().isAdmin()) return true;

    const story = await this.getStory(id);

    // True if createdBy
    if (story.createdBy.id == HnCurrentUserHelper.getCurrentUser().id) {
      return true;
    }

    // False if onlyOwner and current user is not the owner
    if (onlyOwner)
      return false;

    // True if coAuthor of the story otherwise false
    const storyAuthors = await this.getStoryCoAuthors(id);
    return storyAuthors?.some((storyAuthor: HnStoryCoAuthor) => storyAuthor.user.id === HnCurrentUserHelper.getCurrentUser().id);
  }

  async getStoryCoAuthors(storyId: string): Promise<HnStoryCoAuthor[]> {
    return this.storyAuthorService.getStoryCoAuthorsByStoryId(storyId);
  }

  async getStoryCoAuthorsPendingInvites(id: string): Promise<HnStoryCoAuthorInvite[]> {
    await this.checkAndValidateOwnerOrCoAuthor(id, true);
    return this.storyAuthorService.getStoryCoAuthorsPendingInvites(id);
  }

  async removeStoryCoAuthor(id: string, storyAuthorUserId: string): Promise<void> {
    await this.checkAndValidateOwnerOrCoAuthor(id, true);
    return this.storyAuthorService.removeStoryCoAuthor(id, storyAuthorUserId);
  }

  async inviteStoryCoAuthor(storyId: string, coAuthorMail: string): Promise<boolean> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId, true);
    const story: HnStory = await this.getStory(storyId);
    if (story == null)
      throw new BlBadRequestException('Story not found');
    return this.storyAuthorService.inviteStoryCoAuthor(story, coAuthorMail);
  }

  async isInviteValid(token: string): Promise<HnStoryCoAuthorInvite> {
    const storyAuthorInvite: HnStoryCoAuthorInvite = await this.storyAuthorService.getStoryAuthorInviteByToken(token);
    return (storyAuthorInvite && storyAuthorInvite.status === HnInviteStatus.PENDING &&
      storyAuthorInvite.email === HnCurrentUserHelper.getCurrentUser().email) ? storyAuthorInvite : null;
  }

  async acceptInvite(token: string): Promise<HnStory> {
    const storyAuthorInvite: HnStoryCoAuthorInvite = await this.isInviteValid(token);
    if (storyAuthorInvite) {
      const story: HnStory = await this.getStory(storyAuthorInvite.story.id);
      const storyAuthor: HnStoryCoAuthor = new HnStoryCoAuthor();
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


  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.storyAuthorService.deleteCoAuthorInvite(inviteId);
  }

  /////////////////////////////////// RESOURCE VIEW ///////////////////////////////////
  async uploadStoryResourceViewFile(storyId: string, file: BlFile): Promise<string> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId);
    const story: HnStory = await this.getStory(storyId);
    return this.storyFileService.saveResourceView(story, file);
  }


  async setCreatedBy(): Promise<void> {
    const stories: HnStory[] = await this.storyRepository.find({relations: ['storyAuthors']});
    for (const story of stories) {
      story.createdBy = HnCurrentUserHelper.getCurrentUser();
      await this.storyRepository.save(story);
    }
  }


  ////////////////////////////////////// LIKES ////////////////////////////////////////
  async addLike(story: HnStory, entityManager: EntityManager): Promise<HnStory> {
    story.likes++;
    return await entityManager.save(HnStory, story, {listeners: false});
  }

  async removeLike(story: HnStory, entityManager: EntityManager): Promise<HnStory> {
    story.likes--;
    return await entityManager.save(HnStory, story, {listeners: false});
  }


  ////////////////////////////////////// COMMENTS ////////////////////////////////////////
  async addComment(story: HnStory, entityManager: EntityManager): Promise<HnStory> {
    story.comments++;
    return await entityManager.save(HnStory, story, {listeners: false});
  }

  async removeComment(story: HnStory, entityManager: EntityManager): Promise<HnStory> {
    story.comments--;
    return await entityManager.save(HnStory, story, {listeners: false});
  }

  //////////////////////////////////// ADMIN //////////////////////////////////////////
  async migrateStoryBucketItemsNames(): Promise<any> {
    const items: any[] = (await this.storyFileService.getAllBucketItemsName()).map(i => [i.name, i.size]);
    let modif = 0;
    for (const [fileName, size] of items) {
      const storyId = fileName.split('/')[0];
      const story: HnStory = await this.getStory(storyId, false);

      if (story && fileName.split('/').length == 3) {
        const entityFile = await this.storyFileService.getEntityFileByFileName(fileName);
        if (!entityFile) {
          const storyFile = await this.oldStoryFileService.getStoryFileByFileName(fileName);
          const newStoryFileEntity: HnFileStory = new HnFileStory();
          let type = HnFileType.FILE;
          switch (fileName.split('/')[1]) {
            case 'files':
              type = HnFileType.FILE;
              break;
            case 'images':
              type = HnFileType.IMAGE;
              break;
            case 'views':
              type = HnFileType.RESOURCE_VIEW;
              break;
          }
          const name = (storyFile != null && storyFile.humanName != null) ?
            storyFile.humanName : type.toString() + '.' + fileName.split('.')[1];
          newStoryFileEntity.init(story, fileName, type, name, size);

          await this.dataSource.transaction(async entityManager => {
            const savedDocFileEntity = await this.storyFileService.saveFileEntity(storyId, newStoryFileEntity, entityManager);
            await this.updateStoryFilesName(story, savedDocFileEntity, entityManager);
            modif++;
          });
        }
      }
    }
    return modif
  }

  private async updateStoryFilesName(story: HnStory, newStoryFileEntity: HnFileStory, entityManager: EntityManager): Promise<void> {
    let modified = false;

    if (newStoryFileEntity.type == HnFileType.IMAGE && newStoryFileEntity.fileName == story.mainPicture) {
      story.mainPicture = newStoryFileEntity.name;
      modified = true;
    }

    story.content.blocks.forEach((block: any) => {
      if (block.type == 'figure' && newStoryFileEntity.type == HnFileType.IMAGE && block.data.filename == newStoryFileEntity.fileName) {
        block.data.filename = newStoryFileEntity.name;
        modified = true;
      }
      if (block.type == 'file' && newStoryFileEntity.type == HnFileType.FILE && block.data.name == newStoryFileEntity.fileName) {
        block.data.name = newStoryFileEntity.name;
        modified = true;
      }
      if (block.type == 'resourceView' && newStoryFileEntity.type == HnFileType.RESOURCE_VIEW
        && block.data.filename == newStoryFileEntity.fileName) {
        block.data.filename = newStoryFileEntity.name;
        modified = true;
      }
    });

    story.contentEdition.blocks.forEach((block: any) => {
      if (block.type == 'figure' && newStoryFileEntity.type == HnFileType.IMAGE && block.data.filename == newStoryFileEntity.fileName) {
        block.data.filename = newStoryFileEntity.name;
        modified = true;
      }
      if (block.type == 'file' && newStoryFileEntity.type == HnFileType.FILE && block.data.name == newStoryFileEntity.fileName) {
        block.data.name = newStoryFileEntity.name;
        modified = true;
      }
      if (block.type == 'resourceView' && newStoryFileEntity.type == HnFileType.RESOURCE_VIEW
        && block.data.filename == newStoryFileEntity.fileName) {
        block.data.filename = newStoryFileEntity.name;
        modified = true;
      }
    });

    if (modified) {
      await entityManager.save(story, {listeners: false});
    }

    if (newStoryFileEntity.type == HnFileType.FILE &&
      story.contentEdition.blocks.filter((b: any) => b.type == 'file' && b.data.name == newStoryFileEntity.name).length == 0){
      const block: any = {
        id: BlNewRichText.generateRandomBlockId(),
        type: 'file' as any,
        data: {
          id: newStoryFileEntity.id,
          name: newStoryFileEntity.name,
          size: newStoryFileEntity.size,
        }
      } as any;
      (story.contentEdition as BlRichTextContent).blocks.push(block);
      (story.content as BlRichTextContent).blocks.push(block);
    }

    await entityManager.save(story, {listeners: false});
  }
}
