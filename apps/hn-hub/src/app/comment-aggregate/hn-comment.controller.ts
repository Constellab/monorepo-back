import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { HnCommentAggregateService } from './hn-comment-aggregate.service';
import { BlEntityWithId, BlPublic } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';
import { HnAbstractCommentDto } from './comment-core/hn-abstract-comment.dto';
import { TeRichText, TeRichTextPipe } from '@monorepo/te-text-editor';
import { IsAdmin } from '../core/decorators/hn-is-admin.decorator';

@Controller('comment')
export class HnCommentController {
  constructor(private readonly commentAggregateService: HnCommentAggregateService) {}

  @BlPublic()
  @Get(':commentType/:entityId')
  async getComments(
    @Query('page') page: number,
    @Query('size') size: number,
    @Param('commentType') commentType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string
  ): Promise<ClPage<HnAbstractCommentDto<BlEntityWithId>>> {
    return this.commentAggregateService.getComments(commentType, entityId, page, size);
  }

  @Post(':commentType/:entityId')
  async createComment(
    @Param('commentType') commentType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string,
    @Body(TeRichTextPipe) comment: TeRichText
  ): Promise<HnAbstractCommentDto<BlEntityWithId>> {
    return this.commentAggregateService.createComment(commentType, entityId, comment);
  }

  @IsAdmin()
  @Post('migrate-rich-text')
  async migrateOldImages(): Promise<void> {
    return this.commentAggregateService.migrateRichTexts();
  }
}
