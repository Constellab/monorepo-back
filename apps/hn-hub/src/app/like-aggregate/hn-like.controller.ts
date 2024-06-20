import {Controller, Get, Param, ParseUUIDPipe, Post} from '@nestjs/common';
import {HnLikeAggregateService} from './hn-like-aggregate.service';
import {BlEntityWithId, BlPublic} from '@monorepo/back-core-lib';
import {HnEntityType} from '../core/model/entities/hn-entity-type.enum';


@Controller('like')
export class HnLikeController {
  constructor(private readonly likeAggregateService: HnLikeAggregateService) {
  }

  @BlPublic()
  @Get(':likeType/:entityId')
  async checkIfLiked(
    @Param('likeType') likeType: HnEntityType,
    @Param('entityId', new ParseUUIDPipe()) entityId: string): Promise<boolean> {
    return this.likeAggregateService.checkIfIsLiked(entityId, likeType);
  }

  @Post(':likeType/:entityId/like')
  async like(@Param('likeType') likeType: HnEntityType,
                  @Param('entityId', new ParseUUIDPipe()) entityId: string): Promise<BlEntityWithId> {
    return this.likeAggregateService.like(entityId, likeType);
  }

  @Post(':likeType/:entityId/unlike')
  async unlike(@Param('likeType') likeType: HnEntityType,
                    @Param('entityId', new ParseUUIDPipe()) entityId: string): Promise<BlEntityWithId> {
    return this.likeAggregateService.unlike(entityId, likeType);
  }

}
