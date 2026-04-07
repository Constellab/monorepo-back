import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { HnBrick } from '../../brick-aggregate/brick/hn-brick.entity';
import { HnRunStat } from '../run-stat/hn-run-stat.entity';
import { HnRunStatAggregate, HnRunStatAggregateObjectType } from './hn-run-stat-aggregate.entity';

@Injectable()
export class HnRunStatAggregateService {
  constructor(
    @InjectRepository(HnRunStatAggregate) private runStatAggregateRepository: Repository<HnRunStatAggregate>
  ) {}

  async findObjectRunStatGroup(
    objectId: string,
    objectType: HnRunStatAggregateObjectType,
    entityManager?: EntityManager
  ): Promise<HnRunStatAggregate> {
    const repo = entityManager
      ? entityManager.getRepository(HnRunStatAggregate)
      : this.runStatAggregateRepository;
    return repo.findOneBy({ objectId: objectId, objectType: objectType });
  }

  async findByObjectId(objectId: string, entityManager?: EntityManager): Promise<HnRunStatAggregate> {
    const repo = entityManager
      ? entityManager.getRepository(HnRunStatAggregate)
      : this.runStatAggregateRepository;
    return repo.findOneBy({ objectId: objectId });
  }

  async createAgentRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat,
    agentId: string
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = agentId;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.AGENT;
    return entityManager.save(runStatAggregate);
  }

  async createAgentVersionRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = runStat.agentVersion.id;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.AGENT_VERSION;
    return entityManager.save(runStatAggregate);
  }

  async createProcessRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat
  ): Promise<HnRunStatAggregate> {
    if (runStat.processTypingName.startsWith('TASK')) {
      return this.createTaskRunStatGroup(entityManager, runStat);
    } else if (runStat.processTypingName.startsWith('PROTOCOL')) {
      return this.createProtocolRunStatGroup(entityManager, runStat);
    } else {
      throw new BlBadRequestException('Unknown process type');
    }
  }

  async createTaskRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = runStat.processTypingName;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.TASK;
    return entityManager.save(runStatAggregate);
  }

  async createProtocolRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = runStat.processTypingName;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.PROTOCOL;
    return entityManager.save(runStatAggregate);
  }

  async createBrickRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat,
    brick: HnBrick
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = brick.id;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.BRICK;
    return entityManager.save(runStatAggregate);
  }

  async createUserRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat,
    userId: string
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = userId;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.USER;
    return entityManager.save(runStatAggregate);
  }

  async updateProcessRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate = await this.findByObjectId(runStat.processTypingName, entityManager);
    if (!runStatAggregate) return await this.createProcessRunStatGroup(entityManager, runStat);
    return this.updateRunStatGroup(entityManager, runStatAggregate, runStat);
  }

  async updateBrickRunStatGroup(
    entityManager: EntityManager,
    brick: HnBrick,
    runStat: HnRunStat
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate = await this.findObjectRunStatGroup(
      brick.id,
      HnRunStatAggregateObjectType.BRICK,
      entityManager
    );
    if (!runStatAggregate) return await this.createBrickRunStatGroup(entityManager, runStat, brick);
    return this.updateRunStatGroup(entityManager, runStatAggregate, runStat);
  }

  async updateUserRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat,
    userId: string
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate = await this.findObjectRunStatGroup(
      userId,
      HnRunStatAggregateObjectType.USER,
      entityManager
    );
    if (!runStatAggregate) return await this.createUserRunStatGroup(entityManager, runStat, userId);
    return this.updateRunStatGroup(entityManager, runStatAggregate, runStat);
  }

  async updateAgentRunStatGroup(
    entityManager: EntityManager,
    agentId: string,
    runStat: HnRunStat
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate = await this.findObjectRunStatGroup(
      agentId,
      HnRunStatAggregateObjectType.AGENT,
      entityManager
    );
    if (!runStatAggregate) return await this.createAgentRunStatGroup(entityManager, runStat, agentId);
    return this.updateRunStatGroup(entityManager, runStatAggregate, runStat);
  }

  async updateAgentVersionRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat
  ): Promise<HnRunStatAggregate> {
    const runStatAggregate: HnRunStatAggregate = await this.findObjectRunStatGroup(
      runStat.agentVersion.id,
      HnRunStatAggregateObjectType.AGENT_VERSION,
      entityManager
    );
    if (!runStatAggregate) return await this.createAgentVersionRunStatGroup(entityManager, runStat);
    return this.updateRunStatGroup(entityManager, runStatAggregate, runStat);
  }

  private async updateRunStatGroup(
    entityManager: EntityManager,
    runStatAggregate: HnRunStatAggregate,
    runStat: HnRunStat
  ): Promise<HnRunStatAggregate> {
    runStatAggregate.averageElapseTime =
      (runStatAggregate.averageElapseTime * runStatAggregate.executionCount + runStat.elapsedTime) /
      (runStatAggregate.executionCount + 1);
    runStatAggregate.successRate =
      (runStatAggregate.successRate * runStatAggregate.executionCount +
        (runStat.status == 'SUCCESS' ? 1 : 0)) /
      (runStatAggregate.executionCount + 1);
    runStatAggregate.executionCount++;
    return entityManager.save(runStatAggregate);
  }
}
