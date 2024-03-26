import {Injectable} from '@nestjs/common';
import {HnLikeStoryService} from './like-story/hn-like-story.service';
import {HnStory} from '../story/hn-story.entity';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnLikeLiveTaskService} from './like-live-task/hn-like-live-task.service';
import {HnLiveTask} from '../live-task-aggregate/live-task/hn-live-task.entity';
import {HnLikeBrickService} from './like-brick/hn-like-brick.service';
import {HnBrick} from '../brick-aggregate/brick/hn-brick.entity';

@Injectable()
export class HnLikeAggregateService {
  constructor(private readonly likeStoryService: HnLikeStoryService,
              private readonly likeLiveTaskService: HnLikeLiveTaskService,
              private readonly likeBrickService: HnLikeBrickService) {
  }

  ///////////////////////// LIKE STORY /////////////////////////////
  async checkIfStoryIsLiked(storyId: string): Promise<boolean> {
    if (HnCurrentUserHelper.getCurrentUser() == null) {
      return false;
    }
    return this.likeStoryService.checkIfLiked(storyId);
  }

  async likeStory(storyId: string): Promise<HnStory> {
    return this.likeStoryService.like(storyId);
  }

  async unlikeStory(storyId: string): Promise<HnStory> {
    return this.likeStoryService.unlike(storyId);
  }

  ///////////////////////// LIKE LIVE TASK /////////////////////////////
  async checkIfLiveTaskIsLiked(liveTaskId: string): Promise<boolean> {
    if (HnCurrentUserHelper.getCurrentUser() == null) {
      return false;
    }
    return this.likeLiveTaskService.checkIfLiked(liveTaskId);
  }

  async likeLiveTask(liveTaskId: string): Promise<HnLiveTask> {
    return this.likeLiveTaskService.like(liveTaskId);
  }

  async unlikeLiveTask(liveTaskId: string): Promise<HnLiveTask> {
    return this.likeLiveTaskService.unlike(liveTaskId);
  }

  ///////////////////////// LIKE BRICK /////////////////////////////
  async checkIfBrickIsLiked(brickId: string): Promise<boolean> {
    if (HnCurrentUserHelper.getCurrentUser() == null) {
      return false;
    }
    return this.likeBrickService.checkIfLiked(brickId);
  }

  async likeBrick(brickId: string): Promise<HnBrick> {
    return this.likeBrickService.like(brickId);
  }

  async unlikeBrick(brickId: string): Promise<HnBrick> {
    return this.likeBrickService.unlike(brickId);
  }
}
