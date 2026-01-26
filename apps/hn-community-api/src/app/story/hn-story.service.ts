import {
  BlAbstractPaginatedService,
  BlAbstractService,
  BlBadRequestException,
  BlFile,
  BlFileResponse,
  BlSearchBuilder,
  BlSearchParams,
  BlSearchSortCriteria,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import {
  TeBlockFigureUploadedResponse,
  TeRichText,
  TeRichTextAggregate,
  TeRichTextBlockModificationWithUser,
} from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { DataSource, EntityManager, FindOptionsWhere, Like, Repository } from 'typeorm';

import { HnInviteStatus } from '../core/model/config/hn-invite-status.enum';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnMarkdownHelper } from '../core/utils/hn-markdown.helper';
import { HnMarkdownFile, HnZipHelper } from '../core/utils/hn-zip.helper';
import {
  HnAbstractFileEntityDTO,
  HnUploadFileResponseDto,
} from '../file-aggregate/file-core/hn-abstract-file.dto';
import { HnFileStoryService } from '../file-aggregate/file-story/hn-file-story.service';
import { HnStoryCoAuthor } from '../story-author/hn-story-author.entity';
import { HnStoryAuthorService } from '../story-author/hn-story-author.service';
import { HnStoryCoAuthorInvite } from '../story-author-invite/hn-story-author-invite.entity';
import { HnTopicDto } from '../topic/hn-topic.dto';
import { HnTopic } from '../topic/hn-topic.entity';
import { HnTopicService } from '../topic/hn-topic.service';
import { HnUserService } from '../users/hn-user.service';
import { HnCreateStoryDto, HnStoryDto, HnStoryFilter } from './hn-story.dto';
import { HnStory, HnStoryStatus } from './hn-story.entity';

@Injectable()
export class HnStoryService extends BlAbstractService<HnStory> {
  constructor(
    @InjectRepository(HnStory)
    private readonly storyRepository: Repository<HnStory>,
    private readonly topicService: HnTopicService,
    private frontService: HnFrontService,
    private storyAuthorService: HnStoryAuthorService,
    private storyFileService: HnFileStoryService,
    private userService: HnUserService,
    private dataSource: DataSource,
    private coreConfigService: HnCoreConfigService
  ) {
    super(storyRepository, HnStory);
  }

  public async search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<HnStory>> {
    if (!HnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }

    const searchBuilder = new BlSearchBuilder<HnStory>();
    searchBuilder.addSearchParams(searchParams);

    return this.findPaginated(page, size, searchBuilder.build());
  }

  public async downloadStoriesZip(): Promise<BlFileResponse> {
    if (!HnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }
    const stories: HnStory[] = await this.findAllPublished();
    const storiesMarkDowns: HnMarkdownFile[] = [];
    for (const story of stories) {
      const storyUrl = this.frontService.getStoryUrl(story.id, story.cleanTitlePath);
      const storyMarkDown = this.getStoryMarkdown(story, storyUrl);
      storiesMarkDowns.push({
        name: story.cleanTitlePath,
        content: storyMarkDown,
      });
    }

    return HnZipHelper.markdownsToZipFile(storiesMarkDowns, 'stories');
  }

  public async getStoryMarkdownById(storyId: string): Promise<BlFileResponse> {
    const story = await this.getStory(storyId, true);
    const storyUrl = this.frontService.getStoryUrl(story.id, story.cleanTitlePath);
    return HnMarkdownHelper.createMarkdownResponse(
      ClStringHelper.getCleanUrlPath(story.title) + '.md',
      this.getStoryMarkdown(story, storyUrl)
    );
  }

  public getStoryMarkdown(story: HnStory, storyUrl: string): string {
    let storyMarkDown = `# ${story.title}\n\n`;
    storyMarkDown += story
      .getContentRichText()
      .toMarkdown(`${this.coreConfigService.getApiUrl()}story/${story.id}/image`, storyUrl);
    return storyMarkDown;
  }

  async findAll(): Promise<HnStory[]> {
    return this.storyRepository.find();
  }

  async findAllPublished(): Promise<HnStory[]> {
    return this.storyRepository.findBy({ status: HnStoryStatus.PUBLISHED });
  }

  async createStory(data: HnCreateStoryDto): Promise<HnStory> {
    const story = new HnStory();
    story.title = data.title;
    story.content = TeRichText.emptyJson();
    return await this.storyRepository.save(story);
  }

  async findById(id: string): Promise<HnStory> {
    return await this.storyRepository.findOneBy({ id: id });
  }

  async getStoryTitle(id: string): Promise<string> {
    const story = await this.getStory(id);
    return story?.title;
  }

  async getStory(id: string, strict = true): Promise<HnStory> {
    const story = await this.storyRepository.findOne({
      where: {
        id: id,
      },
      relations: ['storyAuthors'],
    });
    if (story == null && strict) {
      throw new BlBadRequestException('Story not found');
    }
    return story;
  }

  async deleteStory(id: string): Promise<void> {
    await this.checkAndValidateOwnerOrCoAuthor(id, true);
    const deleteRes = await this.dataSource.transaction(async (entityManager) => {
      await this.storyFileService.deleteAllEntityFiles(id, entityManager);
      await this.deleteAllStoryCoAuthorsInvites(id, entityManager);
      await this.deleteAllStoryCoAuthors(id, entityManager);
      const res = await entityManager.delete(HnStory, { id: id });
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
      } catch (e: any) {
        throw new BlBadRequestException(
          'Error during the deletion of a story co-author invite : ' + e?.message
        );
      }
    }
  }

  async deleteAllStoryCoAuthors(storyId: string, entityManager: EntityManager): Promise<void> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId, true);
    const storyCoAuthors = await this.storyAuthorService.getStoryCoAuthorsByStoryId(storyId);
    for (const storyCoAuthor of storyCoAuthors) {
      try {
        await entityManager.delete(HnStoryCoAuthor, storyCoAuthor.id);
      } catch (e: any) {
        throw new BlBadRequestException('Error during the deletion of a story co-author : ' + e?.message);
      }
    }
  }

  async getMyStoriesFiltered(
    page: number,
    size: number,
    filters: HnStoryFilter,
    sortsCriteria: BlSearchSortCriteria[] = [{ key: 'createdAt', direction: 'DESC' }]
  ): Promise<ClPage<HnStoryDto>> {
    const where: FindOptionsWhere<HnStory>[] = [
      {
        createdBy: {
          id: HnCurrentUserHelper.getCurrentUser().id,
        },
      },
      {
        storyAuthors: {
          user: {
            id: HnCurrentUserHelper.getCurrentUser().id,
          },
        },
      },
    ];
    const order: any = sortsCriteria?.length > 0 ? {} : { createdAt: 'DESC' };
    for (const sortCriteria of sortsCriteria) {
      order[sortCriteria.key] = sortCriteria.direction;
    }

    if (filters.title && filters.title.length > 0) {
      where.map((w) => (w.title = Like(`%${filters.title}%`)));
    }

    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: where,
          relations: ['storyAuthors'],
          order: order,
        },
        this.storyRepository.manager,
        HnStory
      )
    ).map((story) => {
      return new HnStoryDto(story);
    });
  }

  async getUserStories(userId: string, page: number, size: number): Promise<ClPage<HnStoryDto>> {
    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: [
            {
              createdBy: {
                id: userId,
              },
              status: HnStoryStatus.PUBLISHED,
            },
            {
              storyAuthors: {
                user: {
                  id: userId,
                },
              },
              status: HnStoryStatus.PUBLISHED,
            },
          ],
          order: { publishedAt: 'DESC' as any },
        },
        this.storyRepository.manager,
        HnStory
      )
    ).map((story) => new HnStoryDto(story));
  }

  async getMyStories(page: number, size: number): Promise<ClPage<HnStoryDto>> {
    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: [
            {
              createdBy: {
                id: HnCurrentUserHelper.getCurrentUser().id,
              },
            },
            {
              storyAuthors: {
                user: {
                  id: HnCurrentUserHelper.getCurrentUser().id,
                },
              },
            },
          ],
          order: {
            createdAt: 'DESC' as any,
          },
        },
        this.storyRepository.manager,
        HnStory
      )
    ).map((story) => new HnStoryDto(story));
  }

  async getStoriesByFilter(
    filters: HnStoryFilter,
    sortsCriteria: BlSearchSortCriteria[],
    page: number,
    size: number
  ): Promise<ClPage<HnStoryDto>> {
    const where: FindOptionsWhere<HnStory> = {};

    const order: any = sortsCriteria?.length > 0 ? {} : { createdAt: 'DESC' };
    for (const sortCriteria of sortsCriteria) {
      order[sortCriteria.key] = sortCriteria.direction;
    }

    if (filters.title && filters.title.length > 0) {
      where.title = Like(`%${filters.title}%`);
    }

    where.status = HnStoryStatus.PUBLISHED;
    // TODO: Fix the research + order + relations
    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: where,
          order: order,
        },
        this.storyRepository.manager,
        HnStory
      )
    ).map((story) => new HnStoryDto(story));
  }

  async getStoriesByTopicId(topicId: string, page: number, size: number): Promise<ClPage<HnStoryDto>> {
    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: [
            {
              topics: {
                id: topicId,
              },
              status: HnStoryStatus.PUBLISHED,
            },
          ],
          order: { createdAt: 'DESC' as any },
        },
        this.storyRepository.manager,
        HnStory
      )
    ).map((story) => new HnStoryDto(story));
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
    story.topics = story.topics.filter((t) => t.id !== topicId);
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

    const richText = new TeRichText(story.contentEdition);
    if (story.mainPicture == null) {
      const firstFigureLink = richText.getFirstFigureLink();
      if (firstFigureLink == null) throw new BlBadRequestException('Story must have a main picture');
      story.mainPicture = firstFigureLink;
    }
    story.content = richText.toJson();
    story.firstParagraph = ClStringHelper.replaceLineBreaksBySpace(richText.getFirstParagraphsText());
    return this.storyRepository.save(story);
  }

  async updateStoryContentEdition(id: string, contentEdition: TeRichText): Promise<HnStory> {
    await this.checkAndValidateOwnerOrCoAuthor(id);
    const story = await this.getStory(id);
    const richTextAggregate = story.getContentEditionRichTextAggregate();

    richTextAggregate.updateContent(contentEdition, HnCurrentUserHelper.getAndCheckCurrentUser().id);
    story.setContentEditionRichTextAggregate(richTextAggregate);

    const richText = richTextAggregate.richText;
    const firstFigureLink = richText.getFirstFigureLink();
    if (story.mainPicture == null) {
      story.mainPicture = firstFigureLink;
    } else if (
      firstFigureLink != null &&
      story.mainPicture !== firstFigureLink &&
      richText.isUsedFigure(story.mainPicture)
    ) {
      story.mainPicture = firstFigureLink;
    }
    return this.storyRepository.save(story);
  }

  async saveImage(file: BlFile, storyId: string): Promise<TeBlockFigureUploadedResponse> {
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
    const content = new TeRichText(story.contentEdition);
    if (content.getFirstFigureLink() == null && story.publishedAt != null)
      throw new BlBadRequestException(
        'A published story must have a main picture. \n ' +
          'Add a picture to the story content before deleting the main picture'
      );

    if (story.mainPicture == null) throw new BlBadRequestException('Main picture not found');
    await this.storyFileService.deleteFile(storyId, story.mainPicture);

    story.mainPicture = new TeRichText(story.contentEdition).getFirstFigureLink();
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
    story.titlePath = story.cleanTitlePath;
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
    if (onlyOwner) return false;

    // True if coAuthor of the story otherwise false
    const storyAuthors = await this.getStoryCoAuthors(id);
    return storyAuthors?.some(
      (storyAuthor: HnStoryCoAuthor) => storyAuthor.user.id === HnCurrentUserHelper.getCurrentUser().id
    );
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

  async inviteStoryCoAuthor(storyId: string, emailOrId: string): Promise<boolean> {
    await this.checkAndValidateOwnerOrCoAuthor(storyId, true);
    const story: HnStory = await this.getStory(storyId);
    if (story == null) throw new BlBadRequestException('Story not found');
    return this.storyAuthorService.inviteStoryCoAuthor(story, emailOrId);
  }

  async isInviteValid(token: string): Promise<HnStoryCoAuthorInvite> {
    const storyAuthorInvite: HnStoryCoAuthorInvite =
      await this.storyAuthorService.getStoryAuthorInviteByToken(token);
    return storyAuthorInvite &&
      storyAuthorInvite.status === HnInviteStatus.PENDING &&
      storyAuthorInvite.email === HnCurrentUserHelper.getCurrentUser().email
      ? storyAuthorInvite
      : null;
  }

  async acceptInvite(token: string): Promise<HnStory> {
    const storyAuthorInvite: HnStoryCoAuthorInvite = await this.isInviteValid(token);
    if (storyAuthorInvite) {
      const story: HnStory = await this.getStory(storyAuthorInvite.story.id);
      const storyAuthor: HnStoryCoAuthor = new HnStoryCoAuthor();
      storyAuthor.user = HnCurrentUserHelper.getCurrentUser();
      storyAuthor.story = story;
      const acceptStoryInvite: boolean = await this.storyAuthorService.acceptInvite(
        storyAuthor,
        storyAuthorInvite
      );
      return acceptStoryInvite ? story : null;
    }
    throw new Error('Invalid invite');
  }

  async getAllStoriesMap(): Promise<HnSitemapItemBase[]> {
    const stories: HnStory[] = await this.storyRepository.find({
      where: { status: HnStoryStatus.PUBLISHED },
    });
    return stories.map((story: HnStory) => ({
      url: this.frontService.getStoryUrl(story.id, story.cleanTitlePath),
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
    const stories: HnStory[] = await this.storyRepository.find({
      relations: ['storyAuthors'],
    });
    for (const story of stories) {
      story.createdBy = HnCurrentUserHelper.getCurrentUser();
      await this.storyRepository.save(story);
    }
  }

  ////////////////////////////////////// LIKES ////////////////////////////////////////
  async updateLikes(storyId: string, numberOfLikes: number): Promise<void> {
    const story: HnStory = await this.getStory(storyId);
    story.likes = numberOfLikes;
    await this.storyRepository.save(story, { listeners: false });
  }

  ////////////////////////////////////// COMMENTS ////////////////////////////////////////

  async updateComments(storyId: string, numberOfComments: number): Promise<void> {
    const story: HnStory = await this.getStory(storyId);
    story.comments = numberOfComments;
    await this.storyRepository.save(story, { listeners: false });
  }

  //////////////////////////////////// STORY FILES /////////////////////////////////////
  async getStoryFiles(storyId: string): Promise<HnAbstractFileEntityDTO[]> {
    const story = await this.getStory(storyId);
    return this.storyFileService.getStoryFiles(story);
  }

  /////////////////////////////////// HISTORY //////////////////////////////////////////

  async getUndoContent(storyId: string, modificationId: string): Promise<TeRichTextAggregate> {
    const story: HnStory = await this.getStory(storyId);
    const richText = story.getContentEditionRichTextAggregate();
    richText.undoModifications(modificationId);
    return richText;
  }

  async rollbackContent(storyId: string, modificationId: string): Promise<HnStory> {
    const story: HnStory = await this.getStory(storyId);

    const newRichText = await this.getUndoContent(storyId, modificationId);
    story.setContentEditionRichTextAggregate(newRichText);

    return this.storyRepository.save(story);
  }

  async getStoryModifications(storyId: string): Promise<TeRichTextBlockModificationWithUser[]> {
    const story: HnStory = await this.getStory(storyId);
    if (!story.modifications) return [];

    const richText = story.getContentEditionRichTextAggregate();

    return richText.getModificationsDTO((userId) => this.userService.findUserBasicDTO(userId));
  }

  ////////////////////////////////////////// MIGRATION ////////////////////////////////////
  async migrateTitlePaths(): Promise<void> {
    const stories: HnStory[] = await this.storyRepository.find();
    for (const story of stories) {
      if (story.titlePath == null && story.status == HnStoryStatus.PUBLISHED) {
        story.titlePath = story.cleanTitlePath;
        await this.storyRepository.save(story);
      }
    }
  }
}
