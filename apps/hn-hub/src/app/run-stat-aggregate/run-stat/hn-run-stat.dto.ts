import { HnUserDto } from '../../users/hn-user.dto';
import { HnRunStat } from './hn-run-stat.entity';

export class HnRunStatFromLabDto {
  id: string;
  created_at: string;
  last_modified_at: string;
  process_typing_name: string;
  status: string;
  error_info?: Record<string, any>;
  started_at: string;
  ended_at: string;
  elapsed_time: number;
  brick_version_on_run: string;
  brick_version_on_create: string;
  config_value: Record<string, any>;
  lab_env: 'DEV' | 'PROD';
  executed_by: string;
  community_agent_version_id?: string;
}

export class HnRunStatDto {
  id: string;
  createdAt: string;
  lastModifiedAt: string;
  processTypingName: string;
  status: string;
  startedAt: string;
  endedAt: string;
  elapsedTime: number;
  brickVersionOnRun: string;
  brickVersionOnCreate: string;
  executedBy: HnUserDto;

  constructor(runStat: HnRunStat) {
    this.id = runStat.id;
    this.createdAt = runStat.createdAt.toISO();
    this.lastModifiedAt = runStat.lastModifiedAt.toISO();
    this.processTypingName = runStat.processTypingName;
    this.status = runStat.status;
    this.startedAt = runStat.startedAt.toISO();
    this.endedAt = runStat.endedAt.toISO();
    this.elapsedTime = runStat.elapsedTime;
    this.brickVersionOnRun = runStat.brickVersionOnRun;
    this.brickVersionOnCreate = runStat.brickVersionOnCreate;
    this.executedBy = new HnUserDto(runStat.executedBy);
  }
}
