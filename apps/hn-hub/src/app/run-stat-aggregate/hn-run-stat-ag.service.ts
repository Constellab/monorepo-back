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

@Injectable()
export class HnRunStatAgService {
  constructor(
    private readonly runStatService: HnRunStatService,
    private readonly runStatAggregateService: HnRunStatAggregateService,
    private readonly userService: HnUserService,
    private readonly brickAggregateService: HnBrickAggregateService,
    private readonly agentAggregateService: HnAgentAggregateService
  ) {}

  async createNewStatsFromLab(stats: HnRunStatFromLabDto[]): Promise<void> {
    for (const stat of stats) {
      const user = await this.userService.findOne(stat.executed_by);
      let agentVersion: HnAgentVersion;
      if (stat.community_agent_version_id) {
        agentVersion = await this.agentAggregateService.getAgentVersionById(stat.community_agent_version_id);
      }
      const runStat = await this.runStatService.initRunStat(stat, user, agentVersion);

      if (agentVersion) {
        await this.onAgentRunStatGroup(runStat, agentVersion);
      } else {
        await this.onNewProcessRunState(runStat);
      }
    }
  }

  async onAgentRunStatGroup(runStat: HnRunStat, agentVersion: HnAgentVersion): Promise<HnRunStatAggregate> {
    const agentVersionRunStatGroup =
      await this.runStatAggregateService.updateAgentVersionRunStatGroup(runStat);
    await this.runStatAggregateService.updateAgentRunStatGroup(agentVersion.agent.id, runStat);
    await this.runStatAggregateService.updateUserRunStatGroup(runStat, agentVersion.agent.createdBy.id);
    return agentVersionRunStatGroup;
  }

  async onNewProcessRunState(runStat: HnRunStat): Promise<HnRunStatAggregate> {
    const updatedProcessRunStatGroup = await this.runStatAggregateService.updateProcessRunStatGroup(runStat);

    const brickName: string = runStat.processTypingName.split('.')[1];
    const brick: HnBrick = await this.brickAggregateService.findBrickByName(brickName);
    if (brick) {
      await this.runStatAggregateService.updateBrickRunStatGroup(brick, runStat);
    }

    await this.runStatAggregateService.updateUserRunStatGroup(runStat, brick.createdBy.id);

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
        const brickName: string = objectId.split('.')[1];
        await this.brickAggregateService.assertCheckBrickSpaceUserByName(brickName);
        break;
      case HnRunStatAggregateObjectType.BRICK:
        await this.brickAggregateService.assertCheckBrickSpaceUserById(objectId);
        break;
    }
  }
}
