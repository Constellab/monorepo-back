import { BlPublic } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { TeRichText, TeRichTextPipe } from '@monorepo/te-text-editor';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';
import { HnAbstractCommentDto } from './comment-core/hn-abstract-comment.dto';
import { HnCommentAggregateService } from './hn-comment-aggregate.service';

@Controller('comment')
export class HnCommentController {
  constructor(private readonly commentAggregateService: HnCommentAggregateService) {}

  @BlPublic()
  @Get(':commentType/:entityId/count')
  async getCommentsCount(
    @Param('commentType') commentType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string
  ): Promise<number> {
    return await this.commentAggregateService.getCommentsCount(entityId, commentType);
  }

  @BlPublic()
  @Get(':commentType/:entityId')
  async getComments(
    @Query('page') page: number,
    @Query('size') size: number,
    @Param('commentType') commentType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string
  ): Promise<ClPage<HnAbstractCommentDto>> {
    return (await this.commentAggregateService.getComments(commentType, entityId, page, size)).map(
      (comment) => new HnAbstractCommentDto(comment)
    );
  }

  @Post(':commentType/:entityId')
  async createComment(
    @Param('commentType') commentType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string,
    @Body(TeRichTextPipe) comment: TeRichText
  ): Promise<HnAbstractCommentDto> {
    return this.commentAggregateService.createComment(commentType, entityId, comment);
  }
}
