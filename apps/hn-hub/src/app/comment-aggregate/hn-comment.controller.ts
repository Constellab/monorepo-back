import {Body, Controller, Get, Param, ParseUUIDPipe, Post, Query} from '@nestjs/common';
import {HnCommentAggregateService} from './hn-comment-aggregate.service';
import {BlEntityWithId, BlPublic, BlRichTextContent} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {HnEntityType} from '../core/model/entities/hn-entity-type.enum';
import {HnAbstractCommentEntity} from './comment-core/hn-abstract-comment.entity';

@Controller('comment')
export class HnCommentController {
  constructor(private readonly commentAggregateService: HnCommentAggregateService) {
  }

  @BlPublic()
  @Get(':commentType/:entityId')
  async getComments(
    @Query('page') page: number,
    @Query('size') size: number,
    @Param('commentType') commentType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string,
  ): Promise<ClPage<HnAbstractCommentEntity<BlEntityWithId>>> {
    return this.commentAggregateService.getComments(commentType, entityId, page, size);
  }

  @Post(':commentType/:entityId')
  async createComment(
    @Param('commentType') commentType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string,
    @Body() comment: BlRichTextContent,
  ): Promise<HnAbstractCommentEntity<BlEntityWithId>> {
    return this.commentAggregateService.createComment(commentType, entityId, comment);
  }
}
