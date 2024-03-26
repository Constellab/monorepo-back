import {Body, Controller, Get, Param, ParseUUIDPipe, Post, Query} from '@nestjs/common';
import {HnCommentAggregateService} from './hn-comment-aggregate.service';
import {BlPublic, BlRichTextContent} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {HnCommentStory} from './comment-story/hn-comment-story.entity';

@Controller('comment-story')
export class HnCommentStoryController {
  constructor(private readonly commentAggregateService: HnCommentAggregateService) {
  }

  @BlPublic()
  @Get(':storyId')
  async getComments(
    @Query('page') page: number,
    @Query('size') size: number,
    @Param('storyId', new ParseUUIDPipe()) storyId: string,
  ): Promise<ClPage<HnCommentStory>> {
    return this.commentAggregateService.getStoryComments(page, size, storyId);
  }

  @Post(':storyId')
  async createComment(
    @Param('storyId', new ParseUUIDPipe()) storyId: string,
    @Body() comment: BlRichTextContent,
  ): Promise<HnCommentStory> {
    return this.commentAggregateService.createStoryComment(storyId, comment);
  }
}
