import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, In, IsNull, Not, Repository} from 'typeorm';
import {HnLiveTask} from './hn-live-task.entity';
import {HnCreateLiveTaskDto} from './hn-live-task.dto';
import {
  BlAbstractPaginatedService,
  BlQuillMigrator,
  BlRichTextI,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {HnSpace} from '../../space-aggregate/space/hn-space.entity';
import {ClPage} from '@monorepo/core-lib';

@Injectable()
export class HnLiveTaskService {
  constructor(
    @InjectRepository(HnLiveTask)
    private liveTaskRepository: Repository<HnLiveTask>
  ) {
  }

  public async findAll(): Promise<HnLiveTask[]> {
    return this.liveTaskRepository.find();
  }

  public async findPublic(): Promise<HnLiveTask[]> {
    return this.liveTaskRepository.find({
      where: {
        space: IsNull(),
        latestPublishVersion: Not(IsNull())
      }
    });
  }

  public async findOne(id: string): Promise<HnLiveTask> {
    return this.liveTaskRepository.findOneBy({id: id});
  }

  public async findAllWithUserSpaces(userSpaces: HnSpace[], page: number, size: number): Promise<ClPage<HnLiveTask>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: [
        {
          space: {
            id: In(userSpaces.map(space => space.id))
          },
          latestPublishVersion: Not(IsNull())
        }, {
          space: IsNull(),
          latestPublishVersion: Not(IsNull())
        }
      ],
      order: {createdAt: 'DESC' as any}
    }, this.liveTaskRepository.manager, HnLiveTask);
  }

  public async findPublicLiveTask(page: number, size: number): Promise<ClPage<HnLiveTask>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: [{
        space: IsNull(),
        latestPublishVersion: Not(IsNull())
      }],
      order: {createdAt: 'DESC' as any}
    }, this.liveTaskRepository.manager, HnLiveTask);
  }

  public async findLiveTaskByIdWithUserSpaces(id: string, userSpaces: HnSpace[]): Promise<HnLiveTask> {
    return this.liveTaskRepository.findOne({
      where: [
        {
          id: id,
          space: {
            id: In(userSpaces.map(space => space.id))
          },
        }, {
          id: id,
          space: IsNull()
        }
      ]
    });
  }

  public async findAllWithSpacesFilter(spacesFilter: string[], publicSelected: boolean,
                                       myLiveTasksSelected: boolean, page: number, size: number): Promise<ClPage<HnLiveTask>> {
    let res: ClPage<HnLiveTask>;

    if (publicSelected && myLiveTasksSelected) {
      res = await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
        where: [
          {
            space: {
              id: In(spacesFilter)
            },
            latestPublishVersion: Not(IsNull())
          },
          {
            space: {
              id: IsNull()
            },
            latestPublishVersion: Not(IsNull())
          }, {
            createdBy: {
              id: HnCurrentUserHelper.getAndCheckCurrentUser().id
            }
          }
        ],
        order: {createdAt: 'DESC' as any}
      }, this.liveTaskRepository.manager, HnLiveTask);
    } else if (publicSelected && !myLiveTasksSelected) {
      res = await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
        where: [
          {
            space: {
              id: In(spacesFilter)
            },
            latestPublishVersion: Not(IsNull())
          },
          {
            space: {
              id: IsNull()
            },
            latestPublishVersion: Not(IsNull())
          }
        ],
        order: {createdAt: 'DESC' as any}
      }, this.liveTaskRepository.manager, HnLiveTask);
    } else if (!publicSelected && myLiveTasksSelected) {
      res = await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
        where: [
          {
            space: {
              id: In(spacesFilter)
            },
            latestPublishVersion: Not(IsNull())
          },
          {
            createdBy: {
              id: HnCurrentUserHelper.getAndCheckCurrentUser().id
            }
          }
        ],
        order: {createdAt: 'DESC' as any}
      }, this.liveTaskRepository.manager, HnLiveTask);
    } else {
      res = await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
        where: [
          {
            space: {
              id: In(spacesFilter)
            },
            latestPublishVersion: Not(IsNull())
          }
        ],
        order: {createdAt: 'DESC' as any}
      }, this.liveTaskRepository.manager, HnLiveTask);
    }
    return res;
  }

  public async findPublicLiveTaskById(id: string): Promise<HnLiveTask> {
    return this.liveTaskRepository.findOneBy({
      id: id,
      space: IsNull(),
      latestPublishVersion: Not(IsNull())
    });
  }

  public async create(liveTaskDto: HnCreateLiveTaskDto, entityManager: EntityManager): Promise<HnLiveTask> {
    const liveTask = HnLiveTask.init(liveTaskDto);
    return entityManager.save(liveTask);
  }

  public async updateDescription(id: string, description: Record<string, any>): Promise<HnLiveTask> {
    const liveTask = await this.checkIfCreatorAndGetLiveTask(id);
    liveTask.description = description;
    return this.liveTaskRepository.save(liveTask);
  }

  public async updateLiveTaskLatestPublishVersion(id: string, latestPublishVersion: number,
                                                  entityManager: EntityManager): Promise<HnLiveTask> {
    const liveTask = await this.checkIfCreatorAndGetLiveTask(id);
    liveTask.latestPublishVersion = liveTask.latestPublishVersion > latestPublishVersion ?
      liveTask.latestPublishVersion : latestPublishVersion;
    return entityManager.save(liveTask);
  }

  public async checkIfCreatorAndGetLiveTask(liveTaskId: string): Promise<HnLiveTask> {
    const liveTask = await this.liveTaskRepository.findOneBy({id: liveTaskId});
    if (!liveTask || liveTask.createdBy.id != HnCurrentUserHelper.getAndCheckCurrentUser().id) {
      throw new BlUnauthorizedException(
        `User ${HnCurrentUserHelper.getAndCheckCurrentUser().id} is not the creator of live task ${liveTask.id}`);
    }

    return liveTask;
  }

  public async migrateLiveTask(liveTask: HnLiveTask): Promise<void> {
    liveTask.descriptionBackup = liveTask.description;
    liveTask.description = new BlQuillMigrator(liveTask.description as BlRichTextI).migrate();
    await this.liveTaskRepository.save(liveTask);
  }
}
