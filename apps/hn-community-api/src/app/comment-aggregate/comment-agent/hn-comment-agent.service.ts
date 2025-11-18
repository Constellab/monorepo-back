import { TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';
import { HnAgentAggregateService } from '../../agent-aggregate/hn-agent-aggregate.service';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { HnCommentAgent } from './hn-comment-agent.entity';

@Injectable()
export class HnCommentAgentService extends HnAbstractCommentService<HnAgent> {
  constructor(
    private agentAggregateService: HnAgentAggregateService,
    @InjectRepository(HnCommentAgent) commentAgentRepository: Repository<HnCommentAgent>,
    eventEmitter: EventEmitter2
  ) {
    super(commentAgentRepository, eventEmitter);
  }

  async getEntityByIdAndCheck(entityId: string): Promise<HnAgent> {
    return this.agentAggregateService.findAgentById(entityId);
  }

  getEntityClass(): typeof HnCommentAgent {
    return HnCommentAgent;
  }

  createComment(entity: HnAgent, commentData: TeRichText): HnCommentAgent {
    const comment: HnCommentAgent = new HnCommentAgent();
    comment.entityId = entity.id;
    comment.entity = entity;
    comment.setContentRichText(commentData);
    return comment;
  }
}
