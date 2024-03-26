import {Body, Controller, Get, Param, ParseUUIDPipe, Post, Query} from '@nestjs/common';
import {HnCommentAggregateService} from './hn-comment-aggregate.service';
import {BlPublic, BlRichTextContent} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {HnCommentLiveTask} from './comment-live-task/hn-comment-live-task.entity';

@Controller('comment-live-task')
export class HnCommentLiveTaskController {
  constructor(private readonly commentAggregateService: HnCommentAggregateService) {
  }

  @BlPublic()
  @Get(':liveTaskId')
  async getComments(
    @Query('page') page: number,
    @Query('size') size: number,
    @Param('liveTaskId', new ParseUUIDPipe()) liveTaskId: string,
  ): Promise<ClPage<HnCommentLiveTask>> {
    return this.commentAggregateService.getLiveTaskComments(page, size, liveTaskId);
  }

  @Post(':liveTaskId')
  async createComment(
    @Param('liveTaskId', new ParseUUIDPipe()) liveTaskId: string,
    @Body() comment: BlRichTextContent,
  ): Promise<HnCommentLiveTask> {
    return this.commentAggregateService.createLiveTaskComment(liveTaskId, comment);
  }
}
