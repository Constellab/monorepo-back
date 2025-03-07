import { Injectable } from '@nestjs/common';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HnCommentAgent } from './hn-comment-agent.entity';
import { HnAgentAggregateService } from '../../agent-aggregate/hn-agent-aggregate.service';
import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TeRichText } from '@monorepo/te-text-editor';

@Injectable()
export class HnCommentAgentService extends HnAbstractCommentService<HnAgent> {
  constructor(
    private agentAggregateService: HnAgentAggregateService,
    @InjectRepository(HnCommentAgent) commentAgentRepository: Repository<HnCommentAgent>,
    dataSource: DataSource,
    eventEmitter: EventEmitter2
  ) {
    super(commentAgentRepository, dataSource, eventEmitter);
  }

  async getEntityAndCheckRightsById(entityId: string): Promise<HnAgent> {
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
