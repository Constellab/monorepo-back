import { Injectable } from '@nestjs/common';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { HnCommentAgent } from './hn-comment-agent.entity';
import { HnAgentAggregateService } from '../../agent-aggregate/hn-agent-aggregate.service';
import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';
import { ClPage } from '@monorepo/core-lib';
import { BlAbstractPaginatedService } from '@monorepo/back-core-lib';
import { TeRichText } from '@monorepo/te-text-editor';

@Injectable()
export class HnCommentAgentService extends HnAbstractCommentService<HnAgent> {
  constructor(
    private agentAggregateService: HnAgentAggregateService,
    @InjectRepository(HnCommentAgent) commentAgentRepository: Repository<HnCommentAgent>,
    dataSource: DataSource
  ) {
    super(commentAgentRepository, dataSource);
  }

  async addComment(entityManager: EntityManager, entity: HnAgent): Promise<HnAgent> {
    return this.agentAggregateService.addComment(entity, entityManager);
  }

  createComment(entity: HnAgent, commentData: TeRichText): HnCommentAgent {
    const comment: HnCommentAgent = new HnCommentAgent();
    comment.entity = entity;
    comment.setContentRichText(commentData);
    return comment;
  }

  async getEntityById(entityId: string): Promise<HnAgent> {
    return this.agentAggregateService.findAgentById(entityId);
  }

  async removeComment(entityManager: EntityManager, entity: HnAgent): Promise<HnAgent> {
    return this.agentAggregateService.removeComment(entity, entityManager);
  }

  async saveComment(entityManager: EntityManager, comment: HnCommentAgent): Promise<HnCommentAgent> {
    return entityManager.save(comment);
  }

  async getComments(page: number, size: number, entityId: string): Promise<ClPage<HnCommentAgent>> {
    return await BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: {
          entity: {
            id: entityId,
          },
        },
        order: {
          createdAt: 'DESC' as any,
        },
      },
      this.repository.manager,
      HnCommentAgent
    );
  }
}
