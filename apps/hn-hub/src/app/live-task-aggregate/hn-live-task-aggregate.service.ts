import { Injectable } from '@nestjs/common';
import { HnLiveTaskService } from './live-task/hn-live-task.service';
import { HnLiveTaskVersionService } from './live-task-version/hn-live-task-version.service';
import { HnLiveTaskVersion, HnLiveTaskVersionState } from './live-task-version/hn-live-task-version.entity';
import {
  HaCreateLiveTaskVersionFromLabResponseDto,
  HnCreateLiveTaskDto,
  HnLiveTaskDto,
  HnLiveTaskForLabDto,
  HnLiveTaskVersionFileInput,
  HnLiveTaskVersionForLabDto
} from './live-task/hn-live-task.dto';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnLiveTask } from './live-task/hn-live-task.entity';
import { DataSource, EntityManager } from 'typeorm';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import {
  BlBadRequestException,
  BlCurrentUserHelper,
  BlFile,
  BlNotFoundException,
  BlRichTextUploadedImageResponse,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import { HnBrickAggregateService } from '../brick-aggregate/hn-brick-aggregate.service';
import { HnBrickVersion } from '../brick-aggregate/brick-version/hn-brick-version.entity';
import {
  HnLiveTaskVersionBrickDependenciesService
} from './live-task-version-brick-dependencies/hn-live-task-version-brick-dependencies.service';
import {
  HnLiveTaskVersionBrickDependencies
} from './live-task-version-brick-dependencies/hn-live-task-version-brick-dependencies.entity';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import { HnLabConstellabApiService } from '../core/service/hn-lab-constellab-api.service';
import { HnLiveTaskCoAuthorService } from './live-task-co-author/hn-live-task-co-author.service';
import { HnLiveTaskCoAuthorInvite } from './live-task-co-author-invite/hn-live-task-co-author-invite.entity';
import { HnInviteStatus } from '../core/model/config/hn-invite-status.enum';
import { HnLiveTaskCoAuthor } from './live-task-co-author/hn-live-task-co-author.entity';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnBrickVersionDto } from '../brick-aggregate/brick-version/hn-brick-version.dto';
import { HnLiveTaskVersionDto } from './live-task-version/hn-live-task-version.dto';
import { HnUserDto } from '../users/hn-user.dto';
import { HnSpaceDto } from '../space-aggregate/space/hn-space.dto';
import { HnUploadFileResponseDto } from '../file-aggregate/file-core/hn-abstract-file.dto';
import { HnFileLiveTaskService } from '../file-aggregate/file-live-task/hn-file-live-task.service';
import { Request } from 'express';

@Injectable()
export class HnLiveTaskAggregateService {

  constructor(
    private readonly liveTaskService: HnLiveTaskService,
    private readonly liveTaskVersionService: HnLiveTaskVersionService,
    private readonly liveTaskVersionBrickDependenciesService: HnLiveTaskVersionBrickDependenciesService,
    private readonly spaceAggregateService: HnSpaceAggregateService,
    private readonly brickAggregateService: HnBrickAggregateService,
    private readonly labConstellabApiService: HnLabConstellabApiService,
    private readonly userService: HnUserService,
    private readonly liveTaskCoAuthorService: HnLiveTaskCoAuthorService,
    private readonly frontService: HnFrontService,
    private readonly liveTaskFileService: HnFileLiveTaskService,
    private dataSource: DataSource
  ) {
  }

  public async create(createLiveTaskDto: HnCreateLiveTaskDto, parentLiveTaskVersionId: string = null,
                      user: HnUser = null): Promise<HnLiveTaskVersion> {
    const currentUser = user ? user : HnCurrentUserHelper.getCurrentUser();
    return await this.dataSource.transaction(async entityManager => {
      if (createLiveTaskDto.space != null) {
        await this.spaceAggregateService.assertCheckSpaceUser(createLiveTaskDto.space.id, currentUser.id);
      }
      const liveTask: HnLiveTask = await this.liveTaskService.create(createLiveTaskDto, entityManager, parentLiveTaskVersionId, user);
      const newLiveTaskVersion =
        await this.liveTaskVersionService.createFirstVersion(liveTask, createLiveTaskDto.versionFile, entityManager);

      for (const brick of createLiveTaskDto.versionFile.bricks) {
        const brickVersion: HnBrickVersion = await this.brickAggregateService.getAndCheckBrickVersion(brick.name, brick.version);
        await this.liveTaskVersionBrickDependenciesService.create(newLiveTaskVersion, brickVersion, entityManager);
      }

      return newLiveTaskVersion;
    });
  }

  public async createForLab(createLiveTaskDto: HnCreateLiveTaskDto, req: Request): Promise<HaCreateLiveTaskVersionFromLabResponseDto> {
    const user = await this.checkIfLabUserAndReturnUser(req);
    const liveTaskVersion: HnLiveTaskVersion = await this.create(createLiveTaskDto, null, user);
    return {
      id: liveTaskVersion.id,
      live_task_id: liveTaskVersion.liveTask.id
    };
  }

  public async forkForLab(parentLiveTaskVersionId: string, createLiveTaskDto: HnCreateLiveTaskDto,
                          req: Request): Promise<HaCreateLiveTaskVersionFromLabResponseDto> {
    const user = await this.checkIfLabUserAndReturnUser(req);
    if (parentLiveTaskVersionId == null) throw new BlBadRequestException('The parent live task version id is required');
    const liveTaskVersion: HnLiveTaskVersion = await this.create(createLiveTaskDto, parentLiveTaskVersionId, user);
    return {
      id: liveTaskVersion.id,
      live_task_id: liveTaskVersion.liveTask.id
    };
  }

  public async createNewVersionForLab(liveTaskId: string, newLiveTaskVersionFile: HnLiveTaskVersionFileInput,
                                      req: Request): Promise<HaCreateLiveTaskVersionFromLabResponseDto> {
    const user = await this.checkIfLabUserAndReturnUser(req);
    const liveTask: HnLiveTask = await this.liveTaskService.findOne(liveTaskId);

    if (liveTask.createdBy.id != user.id) {
      const coAuthors = await this.liveTaskCoAuthorService.getLiveTaskCoAuthorsByLiveTaskId(liveTaskId);
      if (!coAuthors.some(coAuthor => coAuthor.id == user.id))
        throw new BlUnauthorizedException();
    }
    if ((await this.liveTaskVersionService.findLatestByLiveTask(liveTask)).versionState == 'DRAFT')
      throw new BlBadRequestException('The live task has already a draft version');
    const newLiveTaskVersion = await this.createNewDraftVersion(liveTaskId, newLiveTaskVersionFile, true);
    return {
      id: newLiveTaskVersion.id,
      live_task_id: newLiveTaskVersion.liveTask.id
    };
  }

  public async updateTitle(id: string, title: string): Promise<HnLiveTask> {
    return this.liveTaskService.updateTitle(id, title);
  }

  public async updateDescription(id: string, description: Record<string, any>): Promise<HnLiveTask> {
    return this.liveTaskService.updateDescription(id, description);
  }

  public async findPublic(): Promise<HnLiveTaskDto[]> {
    return this.liveTaskService.findPublic();
  }

  /**
   * Find liv task list for lab user
   * @param req
   * @param spacesFilter
   * @param titleFilter
   * @param personalOnly
   * @param page
   * @param size
   */
  public async getLiveTasksForLab(req: Request, spacesFilter: string[], titleFilter: string, personalOnly: boolean,
                                  page: number, size: number): Promise<ClPage<HnLiveTaskForLabDto>> {
    const user = await this.checkIfLabUserAndReturnUser(req);
    return (await this.findAllWithFilters(spacesFilter, titleFilter, page, size, user, personalOnly))
      .map(liveTask => HnLiveTaskForLabDto.fromLiveTask(liveTask));
  }


  public async getLiveTaskForLabByVersionId(req: Request, versionId: string): Promise<HnLiveTaskForLabDto> {
    const user = await this.checkIfLabUserAndReturnUser(req);
    const liveTaskVersion: HnLiveTaskVersion = await this.liveTaskVersionService.findOne(versionId);
    const liveTask = liveTaskVersion.liveTask;
    if (liveTask.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(liveTask.space.id, user.id);
    }
    if (liveTaskVersion?.liveTask == null) {
      throw new BlNotFoundException('Live task not found');
    }
    return HnLiveTaskForLabDto.fromLiveTask(new HnLiveTaskDto(liveTaskVersion.liveTask));
  }

  public async findAllWithFilters(spacesFilter: string[], titleFilter: string, page: number,
                                  size: number, user: HnUser = null, personalOnly: boolean = false): Promise<ClPage<HnLiveTaskDto>> {
    const currentUser = user ? user : HnCurrentUserHelper.getCurrentUser();
    let publicSelected = false;
    let myLiveTasksSelected = false;
    for (const spaceId of spacesFilter) {
      if (spaceId === 'public') publicSelected = true;
      else if (spaceId === 'my-live-tasks') myLiveTasksSelected = true;
      else await this.spaceAggregateService.assertCheckSpaceUser(spaceId, currentUser.id);
    }
    let userSpacesIds: string[] = null;
    let coAuthorLiveTasksIds: string[] = [];
    if (currentUser) {
      userSpacesIds = (await this.spaceAggregateService.findSpacesOfUser(currentUser?.id)).map(space => space.id);
      if (myLiveTasksSelected) {
        coAuthorLiveTasksIds = (await this.liveTaskCoAuthorService.getLiveTaskCoAuthorsByUserId(currentUser.id))
          .map(coAuthor => coAuthor.liveTask.id);
      }
    }

    if (publicSelected) {
      spacesFilter = spacesFilter.filter(spaceId => spaceId !== 'public');
    }
    if (myLiveTasksSelected) {
      spacesFilter = spacesFilter.filter(spaceId => spaceId !== 'my-live-tasks');
    }
    return await this.liveTaskService.findAllWithFiltersPaginated(spacesFilter, titleFilter, publicSelected,
      myLiveTasksSelected, personalOnly, page, size, user, userSpacesIds, coAuthorLiveTasksIds);
  }

  public async findUserLiveTasks(userId: string, page: number, size: number): Promise<ClPage<HnLiveTaskDto>>{
    const user = await this.userService.findOne(userId);
    if (!user) throw new BlNotFoundException('User not found');
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    let commonSpacesIds: string[] = [];
    if(currentUser){
      commonSpacesIds = (await this.spaceAggregateService.getUserCommonSpace(userId)).map(space => space.id);
    }
    return await this.liveTaskService.findUserLiveTasks(user, commonSpacesIds, page, size);

  }

  public async getAllLiveTasksMap(): Promise<HnSitemapItemBase[]> {
    const liveTasks =
      await this.liveTaskService.findAllWithFilters([], '', true, false, false);
    return liveTasks.map((liveTask: HnLiveTask) => ({
      url: this.frontService.getLiveTaskUrl(liveTask.id, ClStringHelper.getCleanUrlPath(liveTask.title)),
      priority: 0.8,
      changefreq: HnSiteMapEnumChangefreq.MONTHLY,
      lastmod: liveTask.lastModifiedAt.toFormat('yyyy-MM-dd'),
    }));
  }


  public async findAll(page: number, size: number): Promise<ClPage<HnLiveTaskDto>> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    if (!currentUser)
      return await this.liveTaskService.findPublicLiveTask(page, size);

    const userSpaces: HnSpaceDto[] = await this.spaceAggregateService.findSpacesOfCurrentUser();
    return await this.liveTaskService.findAllWithUserSpacesPaginated(userSpaces, page, size);
  }

  /**
   * Check if the user is a lab user and return the user
   * @param req
   */
  private async checkIfLabUserAndReturnUser(req: Request): Promise<HnUser> {
    await this.labConstellabApiService.checkApiKeyAndUserIdInCentral(req);
    const currentUser = await this.userService.findOne(req.header('user'));
    if (!currentUser)
      throw new BlUnauthorizedException();
    return currentUser;
  }

  public async findLiveTaskById(id: string): Promise<HnLiveTask> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();

    if (!currentUser)
      return await this.liveTaskService.findPublicLiveTaskById(id);

    const userSpacesId: string[] = (await this.spaceAggregateService.findSpacesOfCurrentUser()).map(space => space.id);
    const liveTask = await this.liveTaskService.findLiveTaskByIdWithUserSpaces(id, userSpacesId);
    if (!liveTask) {
      throw new BlNotFoundException('Live task not found');
    }
    return liveTask;
  }

  public async findLiveTaskTitleById(id: string): Promise<string> {
    return (await this.findLiveTaskById(id))?.title;
  }

  public async getBrickDependencies(liveTaskId: string): Promise<HnBrickVersionDto[]> {
    const liveTask = await this.liveTaskService.findOne(liveTaskId);
    const liveTaskVersion = await this.liveTaskVersionService.findLatestByLiveTask(liveTask);
    const liveTaskVersionBrickDependencies: HnLiveTaskVersionBrickDependencies[] =
      await this.liveTaskVersionBrickDependenciesService.getBrickVersionDependencies(liveTaskVersion.id);
    return liveTaskVersionBrickDependencies.map(liveTaskVersionBrickDependency =>
      new HnBrickVersionDto(liveTaskVersionBrickDependency.brickVersion));
  }

  public async deleteLiveTask(id: string): Promise<void> {
    await this.liveTaskService.checkIfCreatorAndGetLiveTask(id);
    await this.dataSource.transaction(async entityManager => {
      const liveTaskVersions: HnLiveTaskVersion[] = await this.liveTaskVersionService.findAllByLiveTaskId(id);
      for (const liveTaskVersion of liveTaskVersions) {
        await this.liveTaskVersionBrickDependenciesService.deleteByLiveTaskVersionId(entityManager, liveTaskVersion.id);
      }
      await this.liveTaskVersionService.deleteByLiveTaskId(entityManager, id);
      await this.liveTaskService.delete(entityManager, id);
    });

  }


  //////////////////////////////////////////// Live Task Version ////////////////////////////////////////////
  public async findLiveTaskVersionById(id: string): Promise<HnLiveTaskVersionDto> {
    return new HnLiveTaskVersionDto(await this.liveTaskVersionService.findOne(id));
  }

  public async findLiveTaskVersionByLiveTaskIdAndVersionNumber(liveTaskId: string, versionNumber: number): Promise<HnLiveTaskVersionDto> {
    const version = await this.liveTaskVersionService.findByLiveTaskIdAndVersionNumber(liveTaskId, versionNumber);
    if (version.versionState == HnLiveTaskVersionState.PUBLISHED) {
      return new HnLiveTaskVersionDto(version);
    }

    await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask(liveTaskId);
    return new HnLiveTaskVersionDto(version);
  }

  /**
   * Find the latest version of a live task for lab user
   * @param id
   * @param req
   */
  public async findLatestPublishedLiveTaskVersionForLabByLiveTaskId(id: string, req: Request): Promise<HnLiveTaskVersionForLabDto> {
    await this.labConstellabApiService.checkApiKeyAndUserIdInCentral(req);
    const user: HnUser = await this.userService.findOne(req.header('user'));
    const liveTask: HnLiveTask = await this.liveTaskService.findOne(id);
    if (liveTask.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(liveTask.space.id, user.id);
    }
    return HnLiveTaskVersionForLabDto.fromLiveTaskVersion(await this.liveTaskVersionService.findLatestPublishedByLiveTask(liveTask));
  }

  public async findLatestPublishedLiveTaskVersionByLiveTaskId(id: string): Promise<HnLiveTaskVersionDto> {
    const liveTask: HnLiveTask = await this.liveTaskService.findOne(id);
    if (liveTask.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(liveTask.space.id, HnCurrentUserHelper.getCurrentUser().id);
    }
    const res = new HnLiveTaskVersionDto(await this.liveTaskVersionService.findLatestPublishedByLiveTask(liveTask));
    return res;
  }

  public async updateLiveTaskVersionParams(id: string, params: string[]): Promise<HnLiveTaskVersion> {
    await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask((await this.liveTaskVersionService.findOne(id)).liveTask.id);
    return this.liveTaskVersionService.updateParams(id, params);
  }

  public async updateLiveTaskVersionCode(id: string, code: string): Promise<HnLiveTaskVersion> {
    await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask((await this.liveTaskVersionService.findOne(id)).liveTask.id);
    return this.liveTaskVersionService.updateCode(id, code);
  }

  public async updateLiveTaskVersionEnvironment(id: string, environment: string): Promise<HnLiveTaskVersion> {
    await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask((await this.liveTaskVersionService.findOne(id)).liveTask.id);
    return this.liveTaskVersionService.updateEnvironment(id, environment);
  }

  public async publishLiveTaskVersion(id: string): Promise<HnLiveTaskVersion> {
    return await this.dataSource.transaction(async entityManager => {
      await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask((await this.liveTaskVersionService.findOne(id)).liveTask.id);
      const liveTaskVersion: HnLiveTaskVersion = await this.liveTaskVersionService.publish(id, entityManager);
      await this.liveTaskService.updateLiveTaskLatestPublishVersion(liveTaskVersion.liveTask.id, liveTaskVersion.version, entityManager);
      return liveTaskVersion;
    });
  }

  public async createNewDraftVersion(liveTaskId: string, newLiveTaskVersionFile: HnLiveTaskVersionFileInput,
                                     fromLab: boolean = false): Promise<HnLiveTaskVersion> {
    if (!fromLab)
      await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask(liveTaskId);
    const liveTask = await this.liveTaskService.findOne(liveTaskId);
    const latestLiveTaskVersion = await this.liveTaskVersionService.findLatestByLiveTask(liveTask);

    if (latestLiveTaskVersion.versionState == 'DRAFT') throw new BlBadRequestException('The live task has already a draft version');

    return await this.dataSource.transaction(async entityManager => {
      const newLiveTaskVersion =
        await this.liveTaskVersionService.createNewDraftVersion(latestLiveTaskVersion, newLiveTaskVersionFile, entityManager);

      for (const brick of newLiveTaskVersionFile.bricks) {
        const brickVersion: HnBrickVersion = await this.brickAggregateService.getAndCheckBrickVersion(brick.name, brick.version);
        await this.liveTaskVersionBrickDependenciesService.create(newLiveTaskVersion, brickVersion, entityManager);
      }
      return newLiveTaskVersion;
    });
  }

  public async replaceDraftVersion(liveTaskId: string, newLiveTaskVersionFile: HnLiveTaskVersionFileInput,
                                   fromLab: boolean = false): Promise<HnLiveTaskVersion> {
    if (!fromLab)
      await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask(liveTaskId);
    const liveTask = await this.liveTaskService.findOne(liveTaskId);
    const latestLiveTaskVersion = await this.liveTaskVersionService.findLatestByLiveTask(liveTask);

    if (latestLiveTaskVersion?.versionState != 'DRAFT')
      throw new BlBadRequestException('The latest live task version could not be replaced');

    return await this.dataSource.transaction(async entityManager => {
      await this.liveTaskVersionService.deleteById(entityManager, latestLiveTaskVersion.id);

      const newLiveTaskVersion =
        await this.liveTaskVersionService.createNewDraftVersion(latestLiveTaskVersion, newLiveTaskVersionFile, entityManager, true);

      for (const brick of newLiveTaskVersionFile.bricks) {
        const brickVersion: HnBrickVersion = await this.brickAggregateService.getAndCheckBrickVersion(brick.name, brick.version);
        await this.liveTaskVersionBrickDependenciesService.create(newLiveTaskVersion, brickVersion, entityManager);
      }
      return newLiveTaskVersion;
    });
  }

  public async getPublishedLiveTaskVersions(liveTaskId: string): Promise<HnLiveTaskVersionDto[]> {
    const liveTask: HnLiveTask = await this.liveTaskService.findOne(liveTaskId);
    if (BlCurrentUserHelper.getCurrentUser()?.id == liveTask?.createdBy.id) {
      return (await this.liveTaskVersionService.findAllByLiveTaskId(liveTaskId))
        .map(liveTaskVersion => new HnLiveTaskVersionDto(liveTaskVersion));
    }

    const coAuthors = await this.liveTaskCoAuthorService.getLiveTaskCoAuthorsByLiveTaskId(liveTaskId);
    if (coAuthors.some(coAuthor => coAuthor.user.id == BlCurrentUserHelper.getCurrentUser()?.id))
      return (await this.liveTaskVersionService.findAllByLiveTaskId(liveTaskId))
        .map(liveTaskVersion => new HnLiveTaskVersionDto(liveTaskVersion));

    return (await this.liveTaskVersionService.findPublishedByLiveTaskId(liveTaskId))
      .map(liveTaskVersion => new HnLiveTaskVersionDto(liveTaskVersion));
  }

  public async updateLiveTaskVersionInfos(liveTaskVersionId: string, versionInfos: Record<string, any>): Promise<HnLiveTaskVersion> {
    await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask(
      (await this.liveTaskVersionService.findOne(liveTaskVersionId)).liveTask.id);
    return this.liveTaskVersionService.updateVersionInfos(liveTaskVersionId, versionInfos);
  }

  public async getLiveTaskVersionBrickDependencies(liveTaskVersionId: string): Promise<HnBrickVersionDto[]> {
    const liveTaskVersionBrickDependencies: HnLiveTaskVersionBrickDependencies[] =
      await this.liveTaskVersionBrickDependenciesService.getBrickVersionDependencies(liveTaskVersionId);
    return liveTaskVersionBrickDependencies.map(liveTaskVersionBrickDependency =>
      new HnBrickVersionDto(liveTaskVersionBrickDependency.brickVersion));
  }

  ////////////////////////////////////////// LIVE TASKS CO AUTHORS //////////////////////////////////////////
  public async inviteLiveTaskCoAuthor(liveTaskId: string, coAuthorMail: string): Promise<boolean> {
    const liveTask = await this.liveTaskService.checkIfCreatorAndGetLiveTask(liveTaskId);
    return this.liveTaskCoAuthorService.inviteLiveTaskCoAuthor(liveTask, coAuthorMail);
  }

  public async getLiveTaskCoAuthors(liveTaskId: string): Promise<HnUserDto[]> {
    return (await this.liveTaskCoAuthorService.getLiveTaskCoAuthorsByLiveTaskId(liveTaskId))
      .map(liveTaskCoAuthor => new HnUserDto(liveTaskCoAuthor.user));
  }

  public async getLiveTaskCoAuthorsPendingInvites(liveTaskId: string): Promise<HnLiveTaskCoAuthorInvite[]> {
    await this.liveTaskService.checkIfCreatorAndGetLiveTask(liveTaskId);
    return this.liveTaskCoAuthorService.getLiveTaskCoAuthorsPendingInvites(liveTaskId);
  }

  public async removeLiveTaskCoAuthor(id: string, liveTaskCoAuthorUserId: string): Promise<void> {
    await this.liveTaskService.checkIfCreatorAndGetLiveTask(id);
    return this.liveTaskCoAuthorService.removeLiveTaskCoAuthor(id, liveTaskCoAuthorUserId);
  }

  public async isInviteValid(token: string): Promise<HnLiveTaskCoAuthorInvite> {
    const liveTaskCoAuthorInvite: HnLiveTaskCoAuthorInvite = await this.liveTaskCoAuthorService.getLiveTaskCoAuthorInviteByToken(token);
    return (liveTaskCoAuthorInvite && liveTaskCoAuthorInvite.status == HnInviteStatus.PENDING &&
      liveTaskCoAuthorInvite.email === HnCurrentUserHelper.getCurrentUser().email) ? liveTaskCoAuthorInvite : null;
  }

  public async acceptInvite(token: string): Promise<HnLiveTask> {
    const liveTaskCoAuthorInvite: HnLiveTaskCoAuthorInvite = await this.isInviteValid(token);
    if (!liveTaskCoAuthorInvite) throw new Error('Invalid invite');
    const liveTask = await this.liveTaskService.findOne(liveTaskCoAuthorInvite.liveTask.id);
    if (liveTask.space && !(await this.spaceAggregateService.checkSpaceUser(liveTask.space.id, HnCurrentUserHelper.getCurrentUser().id))) {
      throw new BlUnauthorizedException('User is not in the space of the live task');
    }
    const liveTaskCoAuthor: HnLiveTaskCoAuthor = new HnLiveTaskCoAuthor();
    liveTaskCoAuthor.liveTask = liveTask;
    liveTaskCoAuthor.user = HnCurrentUserHelper.getCurrentUser();
    const acceptLiveTaskInvite: boolean = await this.liveTaskCoAuthorService.acceptInvite(liveTaskCoAuthor, liveTaskCoAuthorInvite);
    return acceptLiveTaskInvite ? liveTask : null;
  }

  public async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.liveTaskCoAuthorService.deleteCoAuthorInvite(inviteId);
  }

  public async deleteLiveTaskVersion(id: string): Promise<void> {
    const liveTaskVersion = await this.liveTaskVersionService.findOne(id);
    const liveTask = await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask(liveTaskVersion.liveTask.id);

    //Check number of liveTaskVersion
    const liveTaskVersions = await this.liveTaskVersionService.findAllByLiveTaskId(liveTask.id);
    if (liveTaskVersions.length == 1) {
      throw new BlBadRequestException('The live task must have at least one version');
    }

    await this.dataSource.transaction(async entityManager => {
      await this.liveTaskVersionBrickDependenciesService.deleteByLiveTaskVersionId(entityManager, id);
      await this.liveTaskVersionService.deleteById(entityManager, id);
      if(liveTask.latestPublishVersion == liveTaskVersion.version){
        const latestVersion = await this.liveTaskVersionService.findLatestByLiveTask(liveTask);
        await this.liveTaskService.updateLiveTaskLatestPublishVersion(liveTask.id, latestVersion.version, entityManager);
      }
    });
  }

  ////////////////////////////////////////// LIKES /////////////////////////////////
  public async addLike(liveTask: HnLiveTask, entityManager: EntityManager): Promise<HnLiveTask> {
    liveTask.likes++;
    return entityManager.save(liveTask, {listeners: false});
  }

  public async removeLike(liveTask: HnLiveTask, entityManager: EntityManager): Promise<HnLiveTask> {
    liveTask.likes--;
    return entityManager.save(liveTask, {listeners: false});
  }


  ///////////////////////////////////////// COMMENTS ///////////////////////////////
  public async addComment(liveTask: HnLiveTask, entityManager: EntityManager): Promise<HnLiveTask> {
    liveTask.comments++;
    return entityManager.save(liveTask, {listeners: false});
  }

  public async removeComment(liveTask: HnLiveTask, entityManager: EntityManager): Promise<HnLiveTask> {
    liveTask.comments--;
    return entityManager.save(liveTask, {listeners: false});
  }


  /////////////////////////////////////// FILES  ////////////////////////////////////
  public async saveFile(file: BlFile, liveTaskId: string): Promise<HnUploadFileResponseDto> {
    const liveTask = await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask(liveTaskId);
    return await this.liveTaskFileService.saveFile(liveTask, file);
  }

  public async saveImage(file: BlFile, liveTaskId: string): Promise<BlRichTextUploadedImageResponse> {
    const liveTask = await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask(liveTaskId);
    return await this.liveTaskFileService.saveImage(liveTask, file);
  }

  public async saveView(file: BlFile, liveTaskId: string): Promise<string>{
    const liveTask = await this.liveTaskService.checkIfCreatorOrCoAuthorAndGetLiveTask(liveTaskId);
    return await this.liveTaskFileService.saveResourceView(liveTask, file);
  }
}
