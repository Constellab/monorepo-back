import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnBrick } from '../../brick-aggregate/brick/hn-brick.entity';
import { HnBrickAggregateService } from '../../brick-aggregate/hn-brick-aggregate.service';
import { HnAbstractLikeService } from '../like-core/hn-abstract-like.service';
import { HnLikeBrick } from './hn-like-brick.entity';

@Injectable()
export class HnLikeBrickService extends HnAbstractLikeService<HnBrick> {
  constructor(
    private brickAggregateService: HnBrickAggregateService,
    @InjectRepository(HnLikeBrick) likeBrickRepository: Repository<HnLikeBrick>,
    eventEmitter: EventEmitter2
  ) {
    super(likeBrickRepository, eventEmitter);
  }

  async getEntityAndCheckRightsById(entityId: string): Promise<HnBrick> {
    return this.brickAggregateService.findBrickById(entityId);
  }

  createLike(entity: HnBrick): HnLikeBrick {
    const like: HnLikeBrick = new HnLikeBrick();
    like.entity = entity;
    return like;
  }
}
