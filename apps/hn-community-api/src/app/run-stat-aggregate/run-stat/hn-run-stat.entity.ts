import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { Column, Entity, ManyToOne } from 'typeorm';

import { HnAgentVersion } from '../../agent-aggregate/agent-version/hn-agent-version.entity';
import { HnUser } from '../../users/hn-user.entity';
import { HnRunStatFromLabDto } from './hn-run-stat.dto';

@Entity('run_stat')
export class HnRunStat extends BlEntityWithId {
  @BlLuxonDateTimeColumn()
  createdAt: DateTime;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Column()
  processTypingName: string;

  @Column()
  status: string;

  @Column({ type: 'simple-json', nullable: true })
  errorInfo: Record<string, any>;

  @BlLuxonDateTimeColumn()
  startedAt: DateTime;

  @BlLuxonDateTimeColumn()
  endedAt: DateTime;

  @Column({ type: 'float' })
  elapsedTime: number;

  @Column()
  brickVersionOnRun: string;

  @Column()
  brickVersionOnCreate: string;

  @Column({ type: 'simple-json' })
  configValue: Record<string, any>;

  @Column()
  labId: string;

  @Column()
  labEnv: 'DEV' | 'PROD';

  @Column('simple-array')
  creators: string[];

  @ManyToOne(() => HnUser, { eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: false })
  executedBy: HnUser;

  @ManyToOne(() => HnAgentVersion, { nullable: true, eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  agentVersion: HnAgentVersion;

  init(stat: HnRunStatFromLabDto, user: HnUser, labId: string, agentVersion?: HnAgentVersion): void {
    this.id = stat.id;
    this.createdAt = DateTime.fromISO(stat.created_at);
    this.lastModifiedAt = DateTime.fromISO(stat.last_modified_at);
    this.processTypingName = stat.process_typing_name;
    this.status = stat.status;
    this.errorInfo = stat.error_info;
    this.startedAt = DateTime.fromISO(stat.started_at);
    this.endedAt = DateTime.fromISO(stat.ended_at);
    this.elapsedTime = stat.elapsed_time;
    this.brickVersionOnRun = stat.brick_version_on_run;
    this.brickVersionOnCreate = stat.brick_version_on_create;
    this.configValue = stat.config_value;
    this.labId = labId;
    this.labEnv = stat.lab_env;
    this.executedBy = user;
    this.agentVersion = agentVersion;
  }
}
