import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { HnLikeAggregateService } from './hn-like-aggregate.service';
import { BlPublic } from '@monorepo/back-core-lib';
import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';

@Controller('like')
export class HnLikeController {
  constructor(private readonly likeAggregateService: HnLikeAggregateService) {}

  @BlPublic()
  @Get(':likeType/:entityId')
  async checkIfLiked(
    @Param('likeType') likeType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string
  ): Promise<boolean> {
    return this.likeAggregateService.checkIfIsLiked(entityId, likeType);
  }

  @BlPublic()
  @Get(':likeType/:entityId/count')
  async getLikeCount(
    @Param('likeType') likeType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string
  ): Promise<number> {
    return this.likeAggregateService.getLikeCount(entityId, likeType);
  }

  @Post(':likeType/:entityId/like')
  async like(
    @Param('likeType') likeType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string
  ): Promise<number> {
    return this.likeAggregateService.like(entityId, likeType);
  }

  @Post(':likeType/:entityId/unlike')
  async unlike(
    @Param('likeType') likeType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string
  ): Promise<number> {
    return this.likeAggregateService.unlike(entityId, likeType);
  }
}
