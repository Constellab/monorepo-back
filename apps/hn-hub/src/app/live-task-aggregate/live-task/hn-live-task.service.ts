import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, FindOptionsWhere, In, IsNull, Like, Not, Repository} from 'typeorm';
import {HnLiveTask} from './hn-live-task.entity';
import {HnCreateLiveTaskDto, HnLiveTaskDto} from './hn-live-task.dto';
import {BlAbstractPaginatedService, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {HnSpace} from '../../space-aggregate/space/hn-space.entity';
import {ClPage} from '@monorepo/core-lib';
import {HnUser} from '../../users/hn-user.entity';
import {HnLiveTaskCoAuthorService} from '../live-task-co-author/hn-live-task-co-author.service';
import {HnSpaceDto} from '../../space-aggregate/space/hn-space.dto';

@Injectable()
export class HnLiveTaskService {
  constructor(
    @InjectRepository(HnLiveTask)
    private liveTaskRepository: Repository<HnLiveTask>,
    private liveTaskCoAuthorService: HnLiveTaskCoAuthorService,
  ) {
  }

  public async findAll(): Promise<HnLiveTask[]> {
    return this.liveTaskRepository.find();
  }

  public async findPublic(): Promise<HnLiveTaskDto[]> {
    return (await this.liveTaskRepository.find({
      where: {
        space: IsNull(),
        latestPublishVersion: Not(IsNull())
      }
    })).map(liveTask => new HnLiveTaskDto(liveTask));
  }

  public async findOne(id: string): Promise<HnLiveTask> {
    return this.liveTaskRepository.findOneBy({id: id});
  }


  public async findAllWithUserSpacesPaginated(userSpaces: HnSpaceDto[], page: number, size: number): Promise<ClPage<HnLiveTaskDto>> {
    return (await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
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
    }, this.liveTaskRepository.manager, HnLiveTask)).map((liveTask: HnLiveTask) => new HnLiveTaskDto(liveTask));
  }

  public async findPublicLiveTask(page: number, size: number): Promise<ClPage<HnLiveTaskDto>> {
    return (await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: [{
        space: IsNull(),
        latestPublishVersion: Not(IsNull())
      }],
      order: {createdAt: 'DESC' as any}
    }, this.liveTaskRepository.manager, HnLiveTask)).map(liveTask => new HnLiveTaskDto(liveTask));
  }

  public async findLiveTaskByIdWithUserSpaces(id: string, userSpacesId: string[]): Promise<HnLiveTask> {
    return this.liveTaskRepository.findOne({
      where: [
        {
          id: id,
          space: {
            id: In(userSpacesId)
          },
        }, {
          id: id,
          space: IsNull()
        }
      ]
    });
  }

  public buildFindWhereWithFilters(spacesFilter: string[], titleFilter: string, publicSelected: boolean,
                                   myLiveTasksSelected: boolean, personalOnly: boolean, user: HnUser,
                                   userSpacesIds: string[], coAuthorLiveTasksIds: string[]): FindOptionsWhere<HnLiveTask>[] {
    let where: FindOptionsWhere<HnLiveTask>[];
    const currentUser = user ? user : HnCurrentUserHelper.getCurrentUser();

    if (currentUser == null) {
      where = [
        {
          space: {
            id: IsNull()
          },
          latestPublishVersion: Not(IsNull())
        }
      ];
    } else if (publicSelected && myLiveTasksSelected) {
      where = [
        {
          space: {
            id: In(spacesFilter)
          },
          createdBy: {
            id: currentUser.id
          }
        },
        {
          space: {
            id: IsNull()
          },
          createdBy: {
            id: currentUser.id
          }
        },
        {
          space: {
            id: In(spacesFilter)
          },
          id: In(coAuthorLiveTasksIds)
        },
        {
          space: {
            id: IsNull()
          },
          id: In(coAuthorLiveTasksIds)
        }
      ];
    } else if (publicSelected && !myLiveTasksSelected) {
      where = [
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
      ];
    } else if (!publicSelected && myLiveTasksSelected) {
      if (spacesFilter && spacesFilter.length > 0) {
        where = [
          {
            space: {
              id: In(spacesFilter)
            },
            createdBy: {
              id: currentUser.id
            }
          },
          {
            space: {
              id: In(spacesFilter)
            },
            id: In(coAuthorLiveTasksIds)
          }
        ];
      } else {
        where = [
          {
            createdBy: {
              id: currentUser.id
            }
          },
          {
            id: In(coAuthorLiveTasksIds)
          }
        ];
      }
    } else if (spacesFilter && spacesFilter.length > 0) {
      where = [
        {
          space: {
            id: In(spacesFilter)
          },
          latestPublishVersion: Not(IsNull())
        }
      ];
    } else {
      if (!userSpacesIds) {
        throw new BlUnauthorizedException('User has no space');
      }
      where = [
        {
          latestPublishVersion: Not(IsNull()),
          space: {
            id: IsNull()
          }
        },
        {
          latestPublishVersion: Not(IsNull()),
          space: {
            id: In(userSpacesIds)
          }
        }
      ];
    }

    if (titleFilter && titleFilter.length > 0) {
      where = where.map(w => {
        w.title = Like(`%${titleFilter}%`);
        return w;
      });
    }

    if (personalOnly) {
      where = where.map(w => {
        w.createdBy = {
          id: currentUser.id
        };
        return w;
      });
    }
    return where;
  }

  public async findAllWithFilters(spacesFilter: string[], titleFilter: string, publicSelected: boolean, myLiveTasksSelected: boolean,
                                  personalOnly: boolean, user: HnUser = null, userSpacesIds: string[] = null,
                                  coAuthorLiveTasksIds: string[] = null): Promise<HnLiveTask[]> {
    const where =
      this.buildFindWhereWithFilters(spacesFilter, titleFilter, publicSelected, myLiveTasksSelected,
        personalOnly, user, userSpacesIds, coAuthorLiveTasksIds);

    return this.liveTaskRepository.find({
      where: where,
      order: {createdAt: 'DESC' as any}
    });
  }


  public async findAllWithFiltersPaginated(
    spacesFilter: string[], titleFilter: string, publicSelected: boolean, myLiveTasksSelected: boolean,
    personalOnly: boolean, page: number, size: number, user: HnUser = null,
    userSpacesIds: string[] = null, coAuthorLiveTasksIds: string[] = null): Promise<ClPage<HnLiveTaskDto>> {

    const where =
      this.buildFindWhereWithFilters(spacesFilter, titleFilter, publicSelected, myLiveTasksSelected,
        personalOnly, user, userSpacesIds, coAuthorLiveTasksIds);

    return (await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: where,
      order: {createdAt: 'DESC' as any}
    }, this.liveTaskRepository.manager, HnLiveTask)).map(liveTask => new HnLiveTaskDto(liveTask));

  }

  public async findPublicLiveTaskById(id: string): Promise<HnLiveTask> {
    return this.liveTaskRepository.findOneBy({
      id: id,
      space: IsNull(),
      latestPublishVersion: Not(IsNull())
    });
  }

  public async create(liveTaskDto: HnCreateLiveTaskDto, entityManager: EntityManager,
                      parentLiveTaskVersionId?: string, user?: HnUser): Promise<HnLiveTask> {
    const liveTask = HnLiveTask.init(liveTaskDto, parentLiveTaskVersionId, user);
    return entityManager.save(liveTask);
  }

  public async updateTitle(id: string, title: string): Promise<HnLiveTask> {
    const liveTask = await this.checkIfCreatorOrCoAuthorAndGetLiveTask(id);
    liveTask.title = title;
    return this.liveTaskRepository.save(liveTask);
  }

  public async updateDescription(id: string, description: Record<string, any>): Promise<HnLiveTask> {
    const liveTask = await this.checkIfCreatorOrCoAuthorAndGetLiveTask(id);
    liveTask.description = description;
    return this.liveTaskRepository.save(liveTask);
  }

  public async updateLiveTaskLatestPublishVersion(id: string, latestPublishVersion: number,
                                                  entityManager: EntityManager): Promise<HnLiveTask> {
    const liveTask = await this.checkIfCreatorOrCoAuthorAndGetLiveTask(id);
    liveTask.latestPublishVersion = liveTask.latestPublishVersion > latestPublishVersion ?
      liveTask.latestPublishVersion : latestPublishVersion;
    return entityManager.save(liveTask);
  }

  public async checkIfCreatorOrCoAuthorAndGetLiveTask(liveTaskId: string): Promise<HnLiveTask> {
    const liveTask = await this.liveTaskRepository.findOneBy({id: liveTaskId});
    if (!liveTask || liveTask.createdBy.id != HnCurrentUserHelper.getAndCheckCurrentUser().id) {
      const coAuthors = await this.liveTaskCoAuthorService.getLiveTaskCoAuthorsByLiveTaskId(liveTaskId);
      if (!coAuthors.some(coAuthor => coAuthor.user.id === HnCurrentUserHelper.getAndCheckCurrentUser().id)) {
        throw new BlUnauthorizedException(
          `User ${HnCurrentUserHelper.getAndCheckCurrentUser().id} is not the creator or co-author of live task ${liveTask.id}`);
      }
    }
    return liveTask;
  }

  public async checkIfCreatorAndGetLiveTask(liveTaskId: string): Promise<HnLiveTask> {
    const liveTask = await this.liveTaskRepository.findOneBy({id: liveTaskId});
    if (!liveTask || liveTask.createdBy.id != HnCurrentUserHelper.getAndCheckCurrentUser().id) {
      throw new BlUnauthorizedException(
        `User ${HnCurrentUserHelper.getAndCheckCurrentUser().id} is not the creator of live task ${liveTask.id}`);
    }

    return liveTask;
  }

  public async delete(entityManager: EntityManager, id: string): Promise<void> {
    await entityManager.delete(HnLiveTask, {id: id});
  }
}
