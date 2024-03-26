import {Controller, Get, Param, Post} from '@nestjs/common';
import {HnLikeAggregateService} from './hn-like-aggregate.service';
import {BlPublic} from '@monorepo/back-core-lib';
import {HnLiveTask} from '../live-task-aggregate/live-task/hn-live-task.entity';

@Controller('like-live-task')
export class HnLikeLiveTaskController {
  constructor(private readonly likeAggregateService: HnLikeAggregateService) {
  }

  @BlPublic()
  @Get(':liveTaskId')
  async checkIfLiked(@Param('liveTaskId') liveTaskId: string): Promise<boolean> {
    return this.likeAggregateService.checkIfLiveTaskIsLiked(liveTaskId);
  }

  @Post(':liveTaskId/like')
  async likeLiveTask(@Param('liveTaskId') liveTaskId: string): Promise<HnLiveTask> {
    return this.likeAggregateService.likeLiveTask(liveTaskId);
  }

  @Post(':liveTaskId/unlike')
  async unlikeLiveTask(@Param('liveTaskId') liveTaskId: string): Promise<HnLiveTask> {
    return this.likeAggregateService.unlikeLiveTask(liveTaskId);
  }

}
