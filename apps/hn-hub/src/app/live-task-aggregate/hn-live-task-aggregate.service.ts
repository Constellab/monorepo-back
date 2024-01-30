import {Injectable} from '@nestjs/common';
import {HnLiveTaskService} from './live-task/hn-live-task.service';
import {HnLiveTaskVersionService} from './live-task-version/hn-live-task-version.service';
import {HnLiveTaskVersion} from './live-task-version/hn-live-task-version.entity';
import {
  HnCreateLiveTaskDto,
  HnLiveTaskVersionFileInput,
  HnLiveTaskVersionForLabDto
} from './live-task/hn-live-task.dto';
import {HnSpaceAggregateService} from '../space-aggregate/hn-space-aggregate.service';
import {HnLiveTask} from './live-task/hn-live-task.entity';
import {DataSource} from 'typeorm';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnSpace} from '../space-aggregate/space/hn-space.entity';
import {ClPage, ClStringHelper} from '@monorepo/core-lib';
import {BlBadRequestException, BlCurrentUserHelper, BlQuillMigrator, BlRichTextI} from '@monorepo/back-core-lib';
import {HnBrickAggregateService} from '../brick-aggregate/hn-brick-aggregate.service';
import {HnBrickVersion} from '../brick-aggregate/brick-version/hn-brick-version.entity';
import {
  HnLiveTaskVersionBrickDependenciesService
} from './live-task-version-brick-dependencies/hn-live-task-version-brick-dependencies.service';
import {
  HnLiveTaskVersionBrickDependencies
} from './live-task-version-brick-dependencies/hn-live-task-version-brick-dependencies.entity';

@Injectable()
export class HnLiveTaskAggregateService {

  constructor(
    private readonly liveTaskService: HnLiveTaskService,
    private readonly liveTaskVersionService: HnLiveTaskVersionService,
    private readonly liveTaskVersionBrickDependenciesService: HnLiveTaskVersionBrickDependenciesService,
    private readonly spaceAggregateService: HnSpaceAggregateService,
    private readonly brickAggregateService: HnBrickAggregateService,
    private dataSource: DataSource
  ) {
  }

  public async create(createLiveTaskDto: HnCreateLiveTaskDto): Promise<HnLiveTaskVersion> {
    return await this.dataSource.transaction(async entityManager => {
      if (createLiveTaskDto.space != null) {
        await this.spaceAggregateService.checkSpaceUser(createLiveTaskDto.space.id, HnCurrentUserHelper.getCurrentUser().id);
      }
      const liveTask: HnLiveTask = await this.liveTaskService.create(createLiveTaskDto, entityManager);
      const newLiveTaskVersion =
        await this.liveTaskVersionService.createFirstVersion(liveTask, createLiveTaskDto.versionFile, entityManager);

      for(const brick of createLiveTaskDto.versionFile.bricks) {
        const brickVersion: HnBrickVersion = await this.brickAggregateService.getAndCheckBrickVersion(brick.name, brick.version);
        await this.liveTaskVersionBrickDependenciesService.create(newLiveTaskVersion, brickVersion, entityManager);
      }

      return newLiveTaskVersion;
    });
  }

  public async updateDescription(id: string, description: Record<string, any>): Promise<HnLiveTask> {
    return this.liveTaskService.updateDescription(id, description);
  }

  public async findPublic(): Promise<HnLiveTask[]> {
    return this.liveTaskService.findPublic();
  }

  public async findAll(page: number, size: number): Promise<ClPage<HnLiveTask>> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    if (!currentUser)
      return await this.liveTaskService.findPublicLiveTask(page, size);

    const userSpaces: HnSpace[] = await this.spaceAggregateService.findSpacesOfCurrentUser();
    return await this.liveTaskService.findAllWithUserSpaces(userSpaces, page, size);
  }

  public async findAllWithSpacesFilter(spacesFilter: string[], page: number, size: number): Promise<ClPage<HnLiveTask>> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    let publicSelected = false;
    let myLiveTasksSelected = false;
    for (const spaceId of spacesFilter) {
      if (spaceId === 'public') publicSelected = true;
      else if (spaceId === 'my-live-tasks') myLiveTasksSelected = true;
      else await this.spaceAggregateService.checkSpaceUser(spaceId, currentUser.id);
    }

    return await this.liveTaskService.findAllWithSpacesFilter(spacesFilter, publicSelected, myLiveTasksSelected, page, size);
  }

  public async findLiveTaskById(id: string): Promise<HnLiveTask> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();

    if (!currentUser)
      return await this.liveTaskService.findPublicLiveTaskById(id);

    const userSpaces: HnSpace[] = await this.spaceAggregateService.findSpacesOfCurrentUser();
    return await this.liveTaskService.findLiveTaskByIdWithUserSpaces(id, userSpaces);
  }

  public async getBrickDependencies(liveTaskId: string): Promise<HnBrickVersion[]> {
    const liveTask = await this.liveTaskService.findOne(liveTaskId);
    const liveTaskVersion = await this.liveTaskVersionService.findLatestByLiveTask(liveTask);
    const liveTaskVersionBrickDependencies: HnLiveTaskVersionBrickDependencies[] =
      await this.liveTaskVersionBrickDependenciesService.getBrickVersionDependencies(liveTaskVersion.id);
    return liveTaskVersionBrickDependencies.map(liveTaskVersionBrickDependency => liveTaskVersionBrickDependency.brickVersion);
  }


  //////////////////////////////////////////// Live Task Version ////////////////////////////////////////////
  public async findLiveTaskVersionById(id: string): Promise<HnLiveTaskVersion> {
    //TODO: secure
    return this.liveTaskVersionService.findOne(id);
  }

  public async findLiveTaskVersionForLab(id: string): Promise<HnLiveTaskVersionForLabDto>{
    const liveTaskVersion: HnLiveTaskVersion = await this.liveTaskVersionService.findOne(id);
    return HnLiveTaskVersionForLabDto.fromLiveTaskVersion(liveTaskVersion);
  }

  public async findLatestPublishedLiveTaskVersionByLiveTaskId(id: string): Promise<HnLiveTaskVersion> {
    const liveTask: HnLiveTask = await this.liveTaskService.findOne(id);
    if (liveTask.space != null) {
      await this.spaceAggregateService.checkSpaceUser(liveTask.space.id, HnCurrentUserHelper.getCurrentUser().id);
    }
    return await this.liveTaskVersionService.findLatestPublishedByLiveTask(liveTask);
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

  public async createNewDraftVersion(liveTaskId: string, newLiveTaskVersionFile: HnLiveTaskVersionFileInput): Promise<HnLiveTaskVersion> {
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
}
