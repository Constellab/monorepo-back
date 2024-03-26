import {Injectable} from '@nestjs/common';
import {HnCommentStoryService} from './comment-story/hn-comment-story.service';
import {ClPage} from '@monorepo/core-lib';
import {HnCommentStory} from './comment-story/hn-comment-story.entity';
import {BlRichTextContent} from '@monorepo/back-core-lib';
import {HnCommentLiveTask} from './comment-live-task/hn-comment-live-task.entity';
import {HnCommentLiveTaskService} from './comment-live-task/hn-comment-live-task.service';
import {HnCommentBrick} from './comment-brick/hn-comment-brick.entity';
import {HnCommentBrickService} from './comment-brick/hn-comment-brick.service';

@Injectable()
export class HnCommentAggregateService {
  constructor(private readonly commentStoryService: HnCommentStoryService,
              private readonly commentLiveTaskService: HnCommentLiveTaskService,
              private readonly commentBrickService: HnCommentBrickService) {
  }

  ///////////////////////// COMMENT STORY /////////////////////////////
  async getStoryComments(page: number, size: number, storyId: string): Promise<ClPage<HnCommentStory>> {
    return this.commentStoryService.getComments(page, size, storyId);
  }

  async createStoryComment(storyId: string, comment: BlRichTextContent): Promise<HnCommentStory> {
    return this.commentStoryService.createComment(comment, storyId);
  }

  ///////////////////////// COMMENT LIVE TASK /////////////////////////////
  async getLiveTaskComments(page: number, size: number, liveTaskId: string): Promise<ClPage<HnCommentLiveTask>> {
    return this.commentLiveTaskService.getComments(page, size, liveTaskId);
  }

  async createLiveTaskComment(liveTaskId: string, comment: BlRichTextContent): Promise<HnCommentLiveTask> {
    return this.commentLiveTaskService.createComment(comment, liveTaskId);
  }

  ///////////////////////// COMMENT BRICK /////////////////////////////
  async getBrickComments(page: number, size: number, brickId: string): Promise<ClPage<HnCommentBrick>> {
    return this.commentBrickService.getComments(page, size, brickId);
  }

  async createBrickComment(brickId: string, comment: BlRichTextContent): Promise<HnCommentBrick> {
    return this.commentBrickService.createComment(comment, brickId);
  }
}
