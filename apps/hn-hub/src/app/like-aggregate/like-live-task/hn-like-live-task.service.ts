import {Injectable} from '@nestjs/common';
import {HnAbstractLikeService} from '../like-core/hn-abstract-like.service';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, Repository} from 'typeorm';
import {HnLikeLiveTask} from './hn-like-live-task.entity';
import {HnLiveTask} from '../../live-task-aggregate/live-task/hn-live-task.entity';
import {HnLiveTaskAggregateService} from '../../live-task-aggregate/hn-live-task-aggregate.service';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnLiveTaskDto} from '../../live-task-aggregate/live-task/hn-live-task.dto';

@Injectable()
export class HnLikeLiveTaskService extends HnAbstractLikeService<HnLiveTask> {
  constructor(
    private liveTaskAggregateService: HnLiveTaskAggregateService,
    @InjectRepository(HnLikeLiveTask) likeLiveTaskRepository: Repository<HnLikeLiveTask>,
    dataSource: DataSource
  ) {
    super(likeLiveTaskRepository, dataSource);
  }

  async addLike(entityManager: EntityManager, entity: BlEntityWithId): Promise<HnLiveTaskDto> {
    return new HnLiveTaskDto(await this.liveTaskAggregateService.addLike(entity as HnLiveTask, entityManager));
  }

  getEntityById(entityId: string): Promise<HnLiveTask> {
    return this.liveTaskAggregateService.findLiveTaskById(entityId);
  }

  async removeLike(entityManager: EntityManager, entity: BlEntityWithId): Promise<HnLiveTaskDto> {
    return new HnLiveTaskDto(await this.liveTaskAggregateService.removeLike(entity as HnLiveTask, entityManager));
  }

  async saveLike(entityManager: EntityManager, like: HnLikeLiveTask): Promise<HnLikeLiveTask> {
    return entityManager.save(like);
  }

  createLike(entity: HnLiveTask): HnLikeLiveTask {
    const like: HnLikeLiveTask = new HnLikeLiveTask();
    like.entity = entity;
    return like;
  }
}
