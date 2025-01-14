import { Column, Entity, Unique } from 'typeorm';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnRunStat } from '../run-stat/hn-run-stat.entity';

export enum HnRunStatAggregateObjectType {
  AGENT = 'AGENT',
  AGENT_VERSION = 'AGENT_VERSION',
  TASK = 'TASK',
  PROTOCOL = 'PROTOCOL',
  BRICK = 'BRICK',
  USER = 'USER',
}

@Unique(['objectId', 'objectType'])
@Entity('run_stat_aggregate')
export class HnRunStatAggregate extends BlEntityWithId {
  @Column({ nullable: false })
  objectId: string;

  @Column({ nullable: false, update: false, type: 'enum', enum: HnRunStatAggregateObjectType })
  objectType: HnRunStatAggregateObjectType;

  @Column()
  executionCount: number;

  @Column({ type: 'float' })
  successRate: number;

  @Column({ type: 'float' })
  averageElapseTime: number;

  init(runStat: HnRunStat): void {
    this.executionCount = 1;
    this.successRate = runStat.status == 'SUCCESS' ? 1 : 0;
    this.averageElapseTime = runStat.elapsedTime;
  }
}
