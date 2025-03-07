import { Injectable } from '@nestjs/common';
import { HnAbstractLikeService } from '../like-core/hn-abstract-like.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HnLikeAgent } from './hn-like-agent.entity';
import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';
import { HnAgentAggregateService } from '../../agent-aggregate/hn-agent-aggregate.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class HnLikeAgentService extends HnAbstractLikeService<HnAgent> {
  constructor(
    private agentAggregateService: HnAgentAggregateService,
    @InjectRepository(HnLikeAgent) likeAgentRepository: Repository<HnLikeAgent>,
    dataSource: DataSource,
    eventEmitter: EventEmitter2
  ) {
    super(likeAgentRepository, dataSource, eventEmitter);
  }

  async getEntityAndCheckRightsById(entityId: string): Promise<HnAgent> {
    return this.agentAggregateService.findAgentById(entityId);
  }

  createLike(entity: HnAgent): HnLikeAgent {
    const like: HnLikeAgent = new HnLikeAgent();
    like.entity = entity;
    return like;
  }
}
