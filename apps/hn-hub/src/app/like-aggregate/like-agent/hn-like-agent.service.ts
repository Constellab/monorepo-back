import {Injectable} from '@nestjs/common';
import {HnAbstractLikeService} from '../like-core/hn-abstract-like.service';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, Repository} from 'typeorm';
import {HnLikeAgent} from './hn-like-agent.entity';
import {HnAgent} from '../../agent-aggregate/agent/hn-agent.entity';
import {HnAgentAggregateService} from '../../agent-aggregate/hn-agent-aggregate.service';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnAgentDto} from '../../agent-aggregate/agent/hn-agent.dto';

@Injectable()
export class HnLikeAgentService extends HnAbstractLikeService<HnAgent> {
  constructor(
    private agentAggregateService: HnAgentAggregateService,
    @InjectRepository(HnLikeAgent) likeAgentRepository: Repository<HnLikeAgent>,
    dataSource: DataSource
  ) {
    super(likeAgentRepository, dataSource);
  }

  async addLike(entityManager: EntityManager, entity: BlEntityWithId): Promise<HnAgentDto> {
    return new HnAgentDto(await this.agentAggregateService.addLike(entity as HnAgent, entityManager));
  }

  getEntityById(entityId: string): Promise<HnAgent> {
    return this.agentAggregateService.findAgentById(entityId);
  }

  async removeLike(entityManager: EntityManager, entity: BlEntityWithId): Promise<HnAgentDto> {
    return new HnAgentDto(await this.agentAggregateService.removeLike(entity as HnAgent, entityManager));
  }

  async saveLike(entityManager: EntityManager, like: HnLikeAgent): Promise<HnLikeAgent> {
    return entityManager.save(like);
  }

  createLike(entity: HnAgent): HnLikeAgent {
    const like: HnLikeAgent = new HnLikeAgent();
    like.entity = entity;
    return like;
  }
}
