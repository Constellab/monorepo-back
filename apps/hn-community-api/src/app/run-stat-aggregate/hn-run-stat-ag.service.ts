import { Injectable } from '@nestjs/common';
import { HnRunStatService } from './run-stat/hn-run-stat.service';
import { HnRunStatFromLabDto } from './run-stat/hn-run-stat.dto';
import { HnUserService } from '../users/hn-user.service';
import { HnAgentAggregateService } from '../agent-aggregate/hn-agent-aggregate.service';
import { HnAgentVersion } from '../agent-aggregate/agent-version/hn-agent-version.entity';
import { HnRunStat } from './run-stat/hn-run-stat.entity';
import {
  HnRunStatAggregate,
  HnRunStatAggregateObjectType,
} from './run-stat-aggregate/hn-run-stat-aggregate.entity';
import { HnBrickAggregateService } from '../brick-aggregate/hn-brick-aggregate.service';
import { HnBrick } from '../brick-aggregate/brick/hn-brick.entity';
import { HnRunStatAggregateService } from './run-stat-aggregate/hn-run-stat-aggregate.service';
import { HnTypingName } from '../core/utils/hn-typing-name.class';
import { DataSource, EntityManager } from 'typeorm';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';

@Injectable()
export class HnRunStatAgService {
  constructor(
    private readonly runStatService: HnRunStatService,
    private readonly runStatAggregateService: HnRunStatAggregateService,
    private readonly userService: HnUserService,
    private readonly brickAggregateService: HnBrickAggregateService,
    private readonly agentAggregateService: HnAgentAggregateService,
    private datasource: DataSource
  ) {}

  async createNewStatsFromLab(stats: HnRunStatFromLabDto[]): Promise<void> {
    for (const stat of stats) {
      await this.datasource.transaction(async (entityManager) => {
        const user = await this.userService.findOne(stat.executed_by);
        let agentVersion: HnAgentVersion;
        if (stat.community_agent_version_id) {
          agentVersion = await this.agentAggregateService.findAgentVersionById(
            stat.community_agent_version_id
          );
        }
        const runStat = new HnRunStat();
        runStat.init(stat, user, HnCurrentUserHelper.getAndCheckLabInstanceCurrentLabId(), agentVersion);
        runStat.creators = await this.getRunStatCreators(runStat);
        await this.runStatService.save(entityManager, runStat);

        if (agentVersion) {
          await this.onAgentRunStatGroup(entityManager, runStat, agentVersion);
        } else {
          await this.onNewProcessRunStat(entityManager, runStat);
        }
      });
    }
  }

  /**
   * Update the run stat group for the agent, the agent version and the user on new agent version run stat
   * @param entityManager
   * @param runStat
   * @param agentVersion
   */
  async onAgentRunStatGroup(
    entityManager: EntityManager,
    runStat: HnRunStat,
    agentVersion: HnAgentVersion
  ): Promise<HnRunStatAggregate> {
    const agentVersionRunStatGroup = await this.runStatAggregateService.updateAgentVersionRunStatGroup(
      entityManager,
      runStat
    );
    await this.runStatAggregateService.updateAgentRunStatGroup(entityManager, agentVersion.agent.id, runStat);
    await this.runStatAggregateService.updateUserRunStatGroup(
      entityManager,
      runStat,
      agentVersion.agent.createdBy.id
    );
    return agentVersionRunStatGroup;
  }

  /**
   * Update the run stat group for the process, the brick and the user on new process run stat
   * @param entityManager
   * @param runStat
   */
  async onNewProcessRunStat(entityManager: EntityManager, runStat: HnRunStat): Promise<HnRunStatAggregate> {
    const updatedProcessRunStatGroup = await this.runStatAggregateService.updateProcessRunStatGroup(
      entityManager,
      runStat
    );

    const brickName: string = HnTypingName.getBrickName(runStat.processTypingName);
    const brick: HnBrick = await this.brickAggregateService.findBrickByName(brickName);
    if (brick) {
      await this.runStatAggregateService.updateBrickRunStatGroup(entityManager, brick, runStat);
    }

    await this.runStatAggregateService.updateUserRunStatGroup(entityManager, runStat, brick.createdBy.id);

    return updatedProcessRunStatGroup;
  }

  async getObjectRunStatGroup(
    objectId: string,
    objectType: HnRunStatAggregateObjectType
  ): Promise<HnRunStatAggregate> {
    await this.checkRightOnObject(objectId, objectType);
    return this.runStatAggregateService.findObjectRunStatGroup(objectId, objectType);
  }

  private async checkRightOnObject(
    objectId: string,
    objectType: HnRunStatAggregateObjectType
  ): Promise<void> {
    // check if user has right to see the object information
    switch (objectType) {
      case HnRunStatAggregateObjectType.AGENT:
        await this.agentAggregateService.assertCheckAgentUser(objectId);
        break;
      case HnRunStatAggregateObjectType.AGENT_VERSION:
        await this.agentAggregateService.assertCheckAgentVersionUser(objectId);
        break;
      case HnRunStatAggregateObjectType.TASK || HnRunStatAggregateObjectType.PROTOCOL:
        const brickName: string = HnTypingName.getBrickName(objectId);
        await this.brickAggregateService.assertCheckBrickSpaceUserByName(brickName);
        break;
      case HnRunStatAggregateObjectType.BRICK:
        await this.brickAggregateService.assertCheckBrickSpaceUserById(objectId);
        break;
    }
  }

  async getRunStatCreators(runStat: HnRunStat): Promise<string[]> {
    if (runStat.agentVersion) {
      const agentVersion = await this.agentAggregateService.findAgentVersionById(runStat.agentVersion.id);
      const creators: string[] = [agentVersion.agent.createdBy.id];
      if (agentVersion.agent.agentCoAuthors?.length > 0) {
        for (const agentCoAuthor of agentVersion.agent.agentCoAuthors) {
          if (!creators.includes(agentCoAuthor.user.id)) creators.push(agentCoAuthor.user.id);
        }
      }
      return creators;
    }
    const brickName: string = HnTypingName.getBrickName(runStat.processTypingName);
    const brick: HnBrick = await this.brickAggregateService.findBrickByName(brickName);
    const creators: string[] = [brick.createdBy.id];
    if (brick.brickUsers?.length > 0) {
      for (const brickUser of brick.brickUsers) {
        if (!creators.includes(brickUser.user.id)) creators.push(brickUser.user.id);
      }
    }
    return creators;
  }

  async migrateRunStats(): Promise<void> {
    const runStats = await this.runStatService.findAll();
    await this.datasource.transaction(async (entityManager) => {
      for (const runStat of runStats) {
        runStat.creators = await this.getRunStatCreators(runStat);
        await this.runStatService.save(entityManager, runStat);
      }
    });
  }
}
