import {Injectable} from '@nestjs/common';
import {HnLiveTaskService} from './live-task/hn-live-task.service';
import {HnLiveTaskVersionService} from './live-task-version/hn-live-task-version.service';
import {HnLiveTaskVersion} from './live-task-version/hn-live-task-version.entity';
import {
  HaCreateLiveTaskVersionFromLabResponseDto,
  HnCreateLiveTaskDto,
  HnLiveTaskForLabDto,
  HnLiveTaskVersionFileInput,
  HnLiveTaskVersionForLabDto
} from './live-task/hn-live-task.dto';
import {HnSpaceAggregateService} from '../space-aggregate/hn-space-aggregate.service';
import {HnLiveTask} from './live-task/hn-live-task.entity';
import {DataSource, EntityManager} from 'typeorm';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnSpace} from '../space-aggregate/space/hn-space.entity';
import {ClPage} from '@monorepo/core-lib';
import {BlBadRequestException, BlCurrentUserHelper, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {HnBrickAggregateService} from '../brick-aggregate/hn-brick-aggregate.service';
import {HnBrickVersion} from '../brick-aggregate/brick-version/hn-brick-version.entity';
import {
  HnLiveTaskVersionBrickDependenciesService
} from './live-task-version-brick-dependencies/hn-live-task-version-brick-dependencies.service';
import {
  HnLiveTaskVersionBrickDependencies
} from './live-task-version-brick-dependencies/hn-live-task-version-brick-dependencies.entity';
import {HnUser} from '../users/hn-user.entity';
import {HnUserService} from '../users/hn-user.service';
import {HnLabConstellabApiService} from '../core/service/hn-lab-constellab-api.service';

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
    private dataSource: DataSource
  ) {
  }

  public async create(createLiveTaskDto: HnCreateLiveTaskDto, parentLiveTaskVersionId: string = null,
                      user: HnUser = null): Promise<HnLiveTaskVersion> {
    const currentUser = user ? user : HnCurrentUserHelper.getCurrentUser();
    return await this.dataSource.transaction(async entityManager => {
      if (createLiveTaskDto.space != null) {
        await this.spaceAggregateService.checkSpaceUser(createLiveTaskDto.space.id, currentUser.id);
      }
      const liveTask: HnLiveTask = await this.liveTaskService.create(createLiveTaskDto, entityManager, parentLiveTaskVersionId, user);
      const newLiveTaskVersion =
        await this.liveTaskVersionService.createFirstVersion(liveTask, createLiveTaskDto.versionFile, entityManager);

      for(const brick of createLiveTaskDto.versionFile.bricks) {
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
    }
  }

  public async forkForLab(parentLiveTaskVersionId: string, createLiveTaskDto: HnCreateLiveTaskDto,
                          req: Request): Promise<HaCreateLiveTaskVersionFromLabResponseDto> {
    const user = await this.checkIfLabUserAndReturnUser(req);
    if (parentLiveTaskVersionId == null) throw new BlBadRequestException('The parent live task version id is required')
    const liveTaskVersion: HnLiveTaskVersion = await this.create(createLiveTaskDto, parentLiveTaskVersionId, user);
    return {
      id: liveTaskVersion.id,
      live_task_id: liveTaskVersion.liveTask.id
    }
  }

  public async createNewVersionForLab(liveTaskId: string, newLiveTaskVersionFile: HnLiveTaskVersionFileInput,
                                      req: Request): Promise<HaCreateLiveTaskVersionFromLabResponseDto> {
    const user = await this.checkIfLabUserAndReturnUser(req);
    const liveTask: HnLiveTask = await this.liveTaskService.findOne(liveTaskId);
    if (liveTask.createdBy.id != user.id) throw new BlUnauthorizedException();
    if ((await this.liveTaskVersionService.findLatestByLiveTask(liveTask)).versionState == 'DRAFT')
      throw new BlBadRequestException('The live task has already a draft version');
    const newLiveTaskVersion = await this.createNewDraftVersion(liveTaskId, newLiveTaskVersionFile, true);
    return {
      id: newLiveTaskVersion.id,
      live_task_id: newLiveTaskVersion.liveTask.id
    }
  }

  public async updateTitle(id: string, title: string): Promise<HnLiveTask> {
    await this.liveTaskService.checkIfCreatorAndGetLiveTask(id);
    return this.liveTaskService.updateTitle(id, title);
  }

  public async updateDescription(id: string, description: Record<string, any>): Promise<HnLiveTask> {
    return this.liveTaskService.updateDescription(id, description);
  }

  public async findPublic(): Promise<HnLiveTask[]> {
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
    await this.checkIfLabUserAndReturnUser(req);
    const liveTaskVersion: HnLiveTaskVersion = await this.findLiveTaskVersionById(versionId);
    return HnLiveTaskForLabDto.fromLiveTask(liveTaskVersion?.liveTask);
  }

  public async findAllWithFilters(spacesFilter: string[], titleFilter: string, page: number,
                                  size: number, user: HnUser = null, personalOnly: boolean = false): Promise<ClPage<HnLiveTask>> {
    const currentUser = user ? user : HnCurrentUserHelper.getCurrentUser();
    let publicSelected = false;
    let myLiveTasksSelected = false;
    for (const spaceId of spacesFilter) {
      if (spaceId === 'public') publicSelected = true;
      else if (spaceId === 'my-live-tasks') myLiveTasksSelected = true
      else await this.spaceAggregateService.checkSpaceUser(spaceId, currentUser.id);
    }
    return await this.liveTaskService.findAllWithFilters(spacesFilter, titleFilter, publicSelected,
      myLiveTasksSelected, personalOnly, page, size, user);
  }


  public async findAll(page: number, size: number): Promise<ClPage<HnLiveTask>> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    if (!currentUser)
      return await this.liveTaskService.findPublicLiveTask(page, size);

    const userSpaces: HnSpace[] = await this.spaceAggregateService.findSpacesOfCurrentUser();
    return await this.liveTaskService.findAllWithUserSpacesPaginated(userSpaces, page, size);
  }

  /**
   * Check if the user is a lab user and return the user
   * @param req
   */
  private async checkIfLabUserAndReturnUser(req: Request): Promise<HnUser> {
    await this.labConstellabApiService.checkApiKeyAndUserIdInCentral(req);
    const currentUser = await this.userService.findOne(req.headers['user'])
    if (!currentUser)
      throw new BlUnauthorizedException();
    return currentUser;
  }

  public async findLiveTaskById(id: string): Promise<HnLiveTask> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();

    if (!currentUser)
      return await this.liveTaskService.findPublicLiveTaskById(id);

    const userSpaces: HnSpace[] = await this.spaceAggregateService.findSpacesOfCurrentUser();
    return await this.liveTaskService.findLiveTaskByIdWithUserSpaces(id, userSpaces);
  }

  public async findLiveTaskTitleById(id: string): Promise<string>{
    const liveTask = await this.liveTaskService.findOne(id);
    return liveTask?.title;
  }

  public async getBrickDependencies(liveTaskId: string): Promise<HnBrickVersion[]> {
    const liveTask = await this.liveTaskService.findOne(liveTaskId);
    const liveTaskVersion = await this.liveTaskVersionService.findLatestByLiveTask(liveTask);
    const liveTaskVersionBrickDependencies: HnLiveTaskVersionBrickDependencies[] =
      await this.liveTaskVersionBrickDependenciesService.getBrickVersionDependencies(liveTaskVersion.id);
    return liveTaskVersionBrickDependencies.map(liveTaskVersionBrickDependency => liveTaskVersionBrickDependency.brickVersion);
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
  public async findLiveTaskVersionById(id: string): Promise<HnLiveTaskVersion> {
    //TODO: secure
    return this.liveTaskVersionService.findOne(id);
  }

  /**
   * Find the latest version of a live task for lab user
   * @param id
   * @param req
   */
  public async findLatestPublishedLiveTaskVersionForLabByLiveTaskId(id: string, req: Request): Promise<HnLiveTaskVersionForLabDto> {
    await this.labConstellabApiService.checkApiKeyAndUserIdInCentral(req);
    const user: HnUser = await this.userService.findOne(req.headers['user']);
    const liveTask: HnLiveTask = await this.liveTaskService.findOne(id);
    if (liveTask.space != null) {
      await this.spaceAggregateService.checkSpaceUser(liveTask.space.id, user.id);
    }
    return HnLiveTaskVersionForLabDto.fromLiveTaskVersion(await this.liveTaskVersionService.findLatestPublishedByLiveTask(liveTask));
  }

  public async findLatestPublishedLiveTaskVersionByLiveTaskId(id: string): Promise<HnLiveTaskVersion> {
    const liveTask: HnLiveTask = await this.liveTaskService.findOne(id);
    if (liveTask.space != null) {
      await this.spaceAggregateService.checkSpaceUser(liveTask.space.id, HnCurrentUserHelper.getCurrentUser().id);
    }
    return await this.liveTaskVersionService.findLatestPublishedByLiveTask(liveTask);
  }

  public async updateLiveTaskVersionParams(id: string, params: string[]): Promise<HnLiveTaskVersion> {
    await this.liveTaskService.checkIfCreatorAndGetLiveTask((await this.liveTaskVersionService.findOne(id)).liveTask.id);
    return this.liveTaskVersionService.updateParams(id, params);
  }
  public async updateLiveTaskVersionCode(id: string, code: string): Promise<HnLiveTaskVersion> {
    await this.liveTaskService.checkIfCreatorAndGetLiveTask((await this.liveTaskVersionService.findOne(id)).liveTask.id);
    return this.liveTaskVersionService.updateCode(id, code);
  }

  public async updateLiveTaskVersionEnvironment(id: string, environment: string): Promise<HnLiveTaskVersion> {
    await this.liveTaskService.checkIfCreatorAndGetLiveTask((await this.liveTaskVersionService.findOne(id)).liveTask.id);
    return this.liveTaskVersionService.updateEnvironment(id, environment);
  }

  public async publishLiveTaskVersion(id: string): Promise<HnLiveTaskVersion> {
    return await this.dataSource.transaction(async entityManager => {
      await this.liveTaskService.checkIfCreatorAndGetLiveTask((await this.liveTaskVersionService.findOne(id)).liveTask.id);
      const liveTaskVersion: HnLiveTaskVersion = await this.liveTaskVersionService.publish(id, entityManager);
      await this.liveTaskService.updateLiveTaskLatestPublishVersion(liveTaskVersion.liveTask.id, liveTaskVersion.version, entityManager);
      return liveTaskVersion;
    });
  }

  public async createNewDraftVersion(liveTaskId: string, newLiveTaskVersionFile: HnLiveTaskVersionFileInput,
                                     fromLab: boolean = false): Promise<HnLiveTaskVersion> {
    if (!fromLab)
      await this.liveTaskService.checkIfCreatorAndGetLiveTask(liveTaskId);
    const liveTask = await this.liveTaskService.findOne(liveTaskId);
    const latestLiveTaskVersion = await this.liveTaskVersionService.findLatestByLiveTask(liveTask);

    if (latestLiveTaskVersion.versionState == 'DRAFT') throw new BlBadRequestException('The live task has already a draft version');

    return await this.dataSource.transaction(async entityManager => {
      const newLiveTaskVersion =
        await this.liveTaskVersionService.createNewDraftVersion(latestLiveTaskVersion, newLiveTaskVersionFile, entityManager);

      for(const brick of newLiveTaskVersionFile.bricks) {
        const brickVersion: HnBrickVersion = await this.brickAggregateService.getAndCheckBrickVersion(brick.name, brick.version);
        await this.liveTaskVersionBrickDependenciesService.create(newLiveTaskVersion, brickVersion, entityManager);
      }

      return newLiveTaskVersion;
    });
  }

  public async getPublishedLiveTaskVersions(liveTaskId: string): Promise<HnLiveTaskVersion[]> {
    const liveTask: HnLiveTask = await this.liveTaskService.findOne(liveTaskId);
    if (BlCurrentUserHelper.getCurrentUser()?.id == liveTask?.createdBy.id)
      return await this.liveTaskVersionService.findAllByLiveTaskId(liveTaskId);
    return await this.liveTaskVersionService.findPublishedByLiveTaskId(liveTaskId);
  }

  public async updateLiveTaskVersionInfos(liveTaskVersionId: string, versionInfos: Record<string, any>): Promise<HnLiveTaskVersion> {
    await this.liveTaskService.checkIfCreatorAndGetLiveTask((await this.liveTaskVersionService.findOne(liveTaskVersionId)).liveTask.id);
    return this.liveTaskVersionService.updateVersionInfos(liveTaskVersionId, versionInfos);
  }

  public async getLiveTaskVersionBrickDependencies(liveTaskVersionId: string): Promise<HnBrickVersion[]> {
    const liveTaskVersionBrickDependencies: HnLiveTaskVersionBrickDependencies[] =
      await this.liveTaskVersionBrickDependenciesService.getBrickVersionDependencies(liveTaskVersionId);
    return liveTaskVersionBrickDependencies.map(liveTaskVersionBrickDependency => liveTaskVersionBrickDependency.brickVersion);
  }

  public async migrateLiveTasks(): Promise<void>{
    const liveTasks: HnLiveTask[] = await this.liveTaskService.findAll();
    for(const liveTask of liveTasks){
      if (liveTask.description && liveTask.description.ops) {
        await this.liveTaskService.migrateLiveTask(liveTask);
      }
      const liveTaskVersions: HnLiveTaskVersion[] = await this.liveTaskVersionService.findAllByLiveTaskId(liveTask.id);
      for (const liveTaskVersion of liveTaskVersions){
        if (liveTaskVersion.versionInfos && liveTaskVersion.versionInfos.ops) {
          await this.liveTaskVersionService.migrateLiveTaskVersion(liveTaskVersion);
        }
      }
    }
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
}
