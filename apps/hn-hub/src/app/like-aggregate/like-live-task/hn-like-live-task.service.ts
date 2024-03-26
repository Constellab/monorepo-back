import {Injectable} from '@nestjs/common';
import {HnAbstractLikeService} from '../like-core/hn-abstract-like.service';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {HnLikeLiveTask} from './hn-like-live-task.entity';
import {HnLiveTask} from '../../live-task-aggregate/live-task/hn-live-task.entity';
import {HnLiveTaskAggregateService} from '../../live-task-aggregate/hn-live-task-aggregate.service';

@Injectable()
export class HnLikeLiveTaskService extends HnAbstractLikeService<HnLiveTask> {
  constructor(
    @InjectRepository(HnLikeLiveTask)
    private likeLiveTaskRepository: Repository<HnLikeLiveTask>,
    private liveTaskAggregateService: HnLiveTaskAggregateService,
    private dataSource: DataSource
  ) {
    super();
  }

  async like(storyId: string): Promise<HnLiveTask> {
    if (await this.checkIfLiked(storyId)) {
      throw new Error('Live task already liked');
    }
    const liveTask = await this.liveTaskAggregateService.findLiveTaskById(storyId);
    if (!liveTask) {
      throw new Error('Live task not found');
    }

    const like = new HnLikeLiveTask();
    like.liveTask = liveTask;

    return await this.dataSource.transaction(async entityManager => {
      const newLike = await entityManager.save(like);
      if (!newLike) {
        throw new Error('Error while liking the live task');
      }
      return this.liveTaskAggregateService.addLike(newLike.liveTask, entityManager);
    });
  }

  async unlike(liveTaskId: string): Promise<HnLiveTask> {
    if (!await this.checkIfLiked(liveTaskId)) {
      throw new Error('Live task not liked');
    }
    const like = await this.likeLiveTaskRepository.findOne({
      where: {
        liveTask: {
          id: liveTaskId
        },
        likedBy: {
          id: HnCurrentUserHelper.getCurrentUser().id
        }
      }
    });

    return await this.dataSource.transaction(async entityManager => {
      const removedLike = await entityManager.remove(like);
      if (!removedLike) {
        throw new Error('Error while liking the live task');
      }
      return await this.liveTaskAggregateService.removeLike(removedLike.liveTask, entityManager);
    });
  }

  async checkIfLiked(liveTaskId: string): Promise<boolean> {
    const like = await this.likeLiveTaskRepository.findOne({
      where: {
        liveTask: {
          id: liveTaskId
        },
        likedBy: {
          id: HnCurrentUserHelper.getCurrentUser().id
        }
      }
    });
    return like != null;
  }

}
