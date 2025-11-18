import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';
import { HnAgentAggregateService } from '../../agent-aggregate/hn-agent-aggregate.service';
import { HnAbstractLikeService } from '../like-core/hn-abstract-like.service';
import { HnLikeAgent } from './hn-like-agent.entity';

@Injectable()
export class HnLikeAgentService extends HnAbstractLikeService<HnAgent> {
  constructor(
    private agentAggregateService: HnAgentAggregateService,
    @InjectRepository(HnLikeAgent) likeAgentRepository: Repository<HnLikeAgent>,
    eventEmitter: EventEmitter2
  ) {
    super(likeAgentRepository, eventEmitter);
  }

  async getEntityAndCheckById(entityId: string): Promise<HnAgent> {
    return this.agentAggregateService.findAgentById(entityId);
  }

  createLike(entity: HnAgent): HnLikeAgent {
    const like: HnLikeAgent = new HnLikeAgent();
    like.entity = entity;
    return like;
  }
}
