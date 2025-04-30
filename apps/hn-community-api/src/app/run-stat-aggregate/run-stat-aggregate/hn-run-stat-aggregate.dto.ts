import { HnAgentVersionDto } from '../../agent-aggregate/agent-version/hn-agent-version.dto';
import { HnTask } from '../../task/hn-task.entity';
import { HnProtocol } from '../../protocol/hn-protocol.entity';
import { HnBrickDto } from '../../brick-aggregate/brick/hn-brick.dto';
import { HnUserDto } from '../../users/hn-user.dto';
import { HnAgentDto } from '../../agent-aggregate/agent/hn-agent.dto';

export interface HnRunStatAggregateDto {
  executionCount: number;

  successRate: number;

  averageElapseTime: number;
}

export interface HnAgentRunStatAggregate extends HnRunStatAggregateDto {
  agent: HnAgentDto;
}

export interface HnAgentVersionRunStatAggregate extends HnRunStatAggregateDto {
  agentVersion: HnAgentVersionDto;
}

export interface HnTaskRunStatAggregate extends HnRunStatAggregateDto {
  task: HnTask;
}

export interface HnProtocolRunStatAggregate extends HnRunStatAggregateDto {
  protocol: HnProtocol;
}

export interface HnBrickRunStatAggregate extends HnRunStatAggregateDto {
  brick: HnBrickDto;
}

export interface HnUserRunStatAggregate extends HnRunStatAggregateDto {
  user: HnUserDto;
}
