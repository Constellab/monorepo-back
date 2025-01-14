import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnRunStatAggregate, HnRunStatAggregateObjectType } from './hn-run-stat-aggregate.entity';
import { Repository } from 'typeorm';
import { HnRunStat } from '../run-stat/hn-run-stat.entity';
import { HnBrick } from '../../brick-aggregate/brick/hn-brick.entity';

@Injectable()
export class HnRunStatAggregateService {
  constructor(
    @InjectRepository(HnRunStatAggregate) private runStatAggregateRepository: Repository<HnRunStatAggregate>
  ) {}

  async findObjectRunStatGroup(
    objectId: string,
    objectType: HnRunStatAggregateObjectType
  ): Promise<HnRunStatAggregate> {
    return this.runStatAggregateRepository.findOneBy({ objectId: objectId, objectType: objectType });
  }

  async findByObjectId(objectId: string): Promise<HnRunStatAggregate> {
    return this.runStatAggregateRepository.findOneBy({ objectId: objectId });
  }

  async createAgentRunStatGroup(runStat: HnRunStat, agentId: string): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = agentId;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.AGENT;
    return this.runStatAggregateRepository.save(runStatAggregate);
  }

  async createAgentVersionRunStatGroup(runStat: HnRunStat): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = runStat.agentVersion.id;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.AGENT_VERSION;
    return this.runStatAggregateRepository.save(runStatAggregate);
  }

  async createProcessRunStatGroup(runStat: HnRunStat): Promise<HnRunStatAggregate> {
    if (runStat.processTypingName.startsWith('TASK')) {
      return this.createTaskRunStatGroup(runStat);
    } else if (runStat.processTypingName.startsWith('PROTOCOL')) {
      return this.createProtocolRunStatGroup(runStat);
    } else {
      throw new Error('Unknown process type');
    }
  }

  async createTaskRunStatGroup(runStat: HnRunStat): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = runStat.processTypingName;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.TASK;
    return this.runStatAggregateRepository.save(runStatAggregate);
  }

  async createProtocolRunStatGroup(runStat: HnRunStat): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = runStat.processTypingName;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.PROTOCOL;
    return this.runStatAggregateRepository.save(runStatAggregate);
  }

  async createBrickRunStatGroup(runStat: HnRunStat, brick: HnBrick): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = brick.id;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.BRICK;
    return this.runStatAggregateRepository.save(runStatAggregate);
  }

  async createUserRunStatGroup(runStat: HnRunStat, userId: string): Promise<HnRunStatAggregate> {
    const runStatAggregate = new HnRunStatAggregate();
    runStatAggregate.init(runStat);
    runStatAggregate.objectId = userId;
    runStatAggregate.objectType = HnRunStatAggregateObjectType.USER;
    return this.runStatAggregateRepository.save(runStatAggregate);
  }

  async updateProcessRunStatGroup(runStat: HnRunStat): Promise<HnRunStatAggregate> {
    const runStatAggregate = await this.findByObjectId(runStat.processTypingName);
    if (!runStatAggregate) return await this.createProcessRunStatGroup(runStat);
    return this.updateRunStatGroup(runStatAggregate, runStat);
  }

  async updateBrickRunStatGroup(brick: HnBrick, runStat: HnRunStat): Promise<HnRunStatAggregate> {
    const runStatAggregate = await this.findObjectRunStatGroup(brick.id, HnRunStatAggregateObjectType.BRICK);
    if (!runStatAggregate) return await this.createBrickRunStatGroup(runStat, brick);
    return this.updateRunStatGroup(runStatAggregate, runStat);
  }

  async updateUserRunStatGroup(runStat: HnRunStat, userId: string): Promise<HnRunStatAggregate> {
    const runStatAggregate = await this.findObjectRunStatGroup(userId, HnRunStatAggregateObjectType.USER);
    if (!runStatAggregate) return await this.createUserRunStatGroup(runStat, userId);
    return this.updateRunStatGroup(runStatAggregate, runStat);
  }

  async updateAgentRunStatGroup(agentId: string, runStat: HnRunStat): Promise<HnRunStatAggregate> {
    const runStatAggregate = await this.findObjectRunStatGroup(agentId, HnRunStatAggregateObjectType.AGENT);
    if (!runStatAggregate) return await this.createAgentRunStatGroup(runStat, agentId);
    return this.updateRunStatGroup(runStatAggregate, runStat);
  }

  async updateAgentVersionRunStatGroup(runStat: HnRunStat): Promise<HnRunStatAggregate> {
    const runStatAggregate: HnRunStatAggregate = await this.findObjectRunStatGroup(
      runStat.agentVersion.id,
      HnRunStatAggregateObjectType.AGENT_VERSION
    );
    if (!runStatAggregate) return await this.createAgentVersionRunStatGroup(runStat);
    return this.updateRunStatGroup(runStatAggregate, runStat);
  }

  private async updateRunStatGroup(
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
    return this.runStatAggregateRepository.save(runStatAggregate);
  }
}
