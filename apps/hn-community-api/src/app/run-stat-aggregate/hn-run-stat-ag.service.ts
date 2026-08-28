import { BlNotFoundException } from '@monorepo/back-core-lib';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { HnAgentVersion } from '../agent-aggregate/agent-version/hn-agent-version.entity';
import { HnAgentAggregateService } from '../agent-aggregate/hn-agent-aggregate.service';
import { HnBrick } from '../brick-aggregate/brick/hn-brick.entity';
import { HnBrickUserService } from '../brick-aggregate/brick-user/hn-brick-user.service';
import { HnBrickAggregateService } from '../brick-aggregate/hn-brick-aggregate.service';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnTypingName } from '../core/utils/hn-typing-name.class';
import { HnUserService } from '../users/hn-user.service';
import { HnRunStatFromLabDto } from './run-stat/hn-run-stat.dto';
import { HnRunStat } from './run-stat/hn-run-stat.entity';
import { HnRunStatService } from './run-stat/hn-run-stat.service';
import {
  HnRunStatAggregate,
  HnRunStatAggregateObjectType,
} from './run-stat-aggregate/hn-run-stat-aggregate.entity';
import { HnRunStatAggregateService } from './run-stat-aggregate/hn-run-stat-aggregate.service';

@Injectable()
export class HnRunStatAgService {
  private readonly logger = new Logger(HnRunStatAgService.name);

  constructor(
    private readonly runStatService: HnRunStatService,
    private readonly runStatAggregateService: HnRunStatAggregateService,
    private readonly userService: HnUserService,
    private readonly brickAggregateService: HnBrickAggregateService,
    private readonly brickUserService: HnBrickUserService,
    private readonly agentAggregateService: HnAgentAggregateService,
    private datasource: DataSource
  ) {}

  async createNewStatsFromLab(stats: HnRunStatFromLabDto[]): Promise<void> {
    for (const stat of stats) {
      await this.datasource.transaction(async (entityManager) => {
        const existingRunStat = await this.runStatService.findById(stat.id);
        if (existingRunStat) {
          throw new ConflictException(`Run stat with id ${stat.id} already exists`);
        }

        let user = await this.userService.findOne(stat.executed_by);
        if (!user) {
          this.logger.warn(`User ${stat.executed_by} not found for run stat ${stat.id}, using robot user`);
          user = await this.userService.getRobotUser();
        }
        if (!user) {
          throw new BlNotFoundException(`Robot user not found for run stat ${stat.id}`);
        }
        let agentVersion: HnAgentVersion | undefined;
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
    const agentCreatedBy = agentVersion.agent.createdBy;
    if (!agentCreatedBy) {
      throw new BlNotFoundException(`Agent ${agentVersion.agent.id} has no creator`);
    }
    await this.runStatAggregateService.updateUserRunStatGroup(entityManager, runStat, agentCreatedBy.id);
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
    const brick: HnBrick = await this.brickAggregateService.findBrickByName(brickName, undefined, false);
    if (brick) {
      await this.runStatAggregateService.updateBrickRunStatGroup(entityManager, brick, runStat);
    }

    const brickCreatedBy = brick.createdBy;
    if (!brickCreatedBy) {
      throw new BlNotFoundException(`Brick ${brickName} has no creator`);
    }
    await this.runStatAggregateService.updateUserRunStatGroup(entityManager, runStat, brickCreatedBy.id);

    return updatedProcessRunStatGroup;
  }

  async getObjectRunStatGroup(
    objectId: string,
    objectType: HnRunStatAggregateObjectType
  ): Promise<HnRunStatAggregate | null> {
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
      return this.getAgentCreators(runStat.agentVersion.id);
    }
    return this.getProcessCreators(runStat.processTypingName);
  }

  private async getAgentCreators(agentVersionId: string): Promise<string[]> {
    const agentVersion = await this.agentAggregateService.findAgentVersionById(agentVersionId);
    const agentCreatedBy = agentVersion.agent.createdBy;
    if (!agentCreatedBy) {
      throw new BlNotFoundException(`Agent ${agentVersion.agent.id} has no creator`);
    }
    const creators: string[] = [agentCreatedBy.id];
    if (agentVersion.agent.agentCoAuthors?.length > 0) {
      for (const agentCoAuthor of agentVersion.agent.agentCoAuthors) {
        if (!creators.includes(agentCoAuthor.user.id)) creators.push(agentCoAuthor.user.id);
      }
    }
    return creators;
  }

  private async getProcessCreators(processTypingName: string): Promise<string[]> {
    const brickName: string = HnTypingName.getBrickName(processTypingName);
    const brick: HnBrick = await this.brickAggregateService.findBrickByName(brickName, undefined, false);
    const brickCreatedBy = brick.createdBy;
    if (!brickCreatedBy) {
      throw new BlNotFoundException(`Brick ${brickName} has no creator`);
    }
    const creators: string[] = [brickCreatedBy.id];
    const brickUsers = await this.brickUserService.getBrickUsers(brick);
    if (brickUsers?.length > 0) {
      for (const brickUser of brickUsers) {
        if (!creators.includes(brickUser.user.id)) creators.push(brickUser.user.id);
      }
    }
    return creators;
  }

  /** @deprecated One-shot migration — remove after execution in all environments */
  async migrateRunStats(): Promise<void> {
    const runStats = await this.runStatService.findAll();
    await this.datasource.transaction(async (entityManager) => {
      for (const runStat of runStats) {
        runStat.creators = await this.getRunStatCreators(runStat);
        await this.runStatService.save(entityManager, runStat);
      }
    });
  }

  async recalculateAggregates(): Promise<void> {
    await this.datasource.transaction(async (entityManager) => {
      // Clear all existing aggregates
      await entityManager.createQueryBuilder().delete().from(HnRunStatAggregate).execute();

      // Replay all run stats to rebuild aggregates
      const runStats = await this.runStatService.findAll();
      for (const runStat of runStats) {
        if (runStat.agentVersion) {
          await this.onAgentRunStatGroup(entityManager, runStat, runStat.agentVersion);
        } else {
          await this.onNewProcessRunStat(entityManager, runStat);
        }
      }
    });
  }
}
