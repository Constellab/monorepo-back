import {Body, Controller, Get, Param, ParseUUIDPipe, Post, Query} from '@nestjs/common';
import {HnCommentAggregateService} from './hn-comment-aggregate.service';
import {BlPublic, BlRichTextContent} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {HnCommentBrick} from './comment-brick/hn-comment-brick.entity';

@Controller('comment-brick')
export class HnCommentBrickController {
  constructor(private readonly commentAggregateService: HnCommentAggregateService) {
  }

  @BlPublic()
  @Get(':brickId')
  async getComments(
    @Query('page') page: number,
    @Query('size') size: number,
    @Param('brickId', new ParseUUIDPipe()) brickId: string,
  ): Promise<ClPage<HnCommentBrick>> {
    return this.commentAggregateService.getBrickComments(page, size, brickId);
  }

  @Post(':brickId')
  async createComment(
    @Param('brickId', new ParseUUIDPipe()) brickId: string,
    @Body() comment: BlRichTextContent,
  ): Promise<HnCommentBrick> {
    return this.commentAggregateService.createBrickComment(brickId, comment);
  }
}
