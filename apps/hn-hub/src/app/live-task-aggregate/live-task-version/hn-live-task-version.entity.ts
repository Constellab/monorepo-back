import {BeforeInsert, Column, Entity, ManyToOne, Unique} from 'typeorm';
import {BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable} from '@monorepo/back-core-lib';
import {HnLiveTask} from '../live-task/hn-live-task.entity';
import {DateTime} from 'luxon';
import {ClDateHelper} from '@monorepo/core-lib';
import {HnLiveTaskVersionFileInput} from '../live-task/hn-live-task.dto';

export enum HnLiveTaskVersionState {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT'
}

export enum HnLiveTaskVersionType{
  PYTHON = 'PYTHON',
  CONDA_PYTHON = 'CONDA_PYTHON',
  MAMBA_PYTHON = 'MAMBA_PYTHON',
  PIP_PYTHON = 'PIP_PYTHON',
  CONDA_R = 'CONDA_R',
  MAMBA_R = 'MAMBA_R',
  STREAMLIT = 'STREAMLIT',
}

@Unique(['version', 'liveTask'])
@Entity('live_task_version')
export class HnLiveTaskVersion extends BlEntityWithId {

  @Column({default: 1})
  version: number;

  @BlNotUpdatable()
  @ManyToOne(() => HnLiveTask, {eager: true, onDelete: "CASCADE"})
  liveTask: HnLiveTask;

  @Column({type: 'enum', enum: HnLiveTaskVersionState, nullable: false, default: HnLiveTaskVersionState.DRAFT})
  versionState: HnLiveTaskVersionState;

  @Column({type: 'enum', enum: HnLiveTaskVersionType, nullable: false, default: HnLiveTaskVersionType.PYTHON})
  type: HnLiveTaskVersionType;

  @Column({name: 'versionInfos', type: 'simple-json', nullable: true})
  versionInfos?: Record<string, any>;

  @Column({type: 'simple-array', nullable: true})
  params: string[] = [];

  @Column({type: 'text', nullable: true})
  environment: string;

  @Column({type: 'text', nullable: true})
  code: string;

  @BlLuxonDateTimeColumn({nullable: true, update: false})
  createdAt: DateTime;

  @Column({name: 'inputSpecs', type: 'simple-json', nullable: true})
  inputSpecs?: Record<string, any>;

  @Column({name: 'outputSpecs', type: 'simple-json', nullable: true})
  outputSpecs?: Record<string, any>;

  @Column({name: 'configSpecs', type: 'simple-json', nullable: true})
  configSpecs?: Record<string, any>;

  initVersion(liveTask: HnLiveTask, versionFile: HnLiveTaskVersionFileInput): void {
    this.liveTask = liveTask;
    this.versionState = HnLiveTaskVersionState.DRAFT;
    this.version = 1;
    this.initVersionFile(versionFile);
  }

  initNewDraftVersion(lastLiveTaskVersion: HnLiveTaskVersion, versionFile: HnLiveTaskVersionFileInput, replace = false): void {
    this.version = lastLiveTaskVersion.version + (replace ? 0 : 1);
    this.liveTask = lastLiveTaskVersion.liveTask;
    this.versionState = HnLiveTaskVersionState.DRAFT;
    this.initVersionFile(versionFile);
  }

  private initVersionFile(versionFile: HnLiveTaskVersionFileInput): void {
    this.code = versionFile.code;
    this.params = versionFile.params;
    this.inputSpecs = versionFile.input_specs;
    this.outputSpecs = versionFile.output_specs;
    this.configSpecs = versionFile.config_specs;
    this.environment = versionFile.environment;
    this.type = versionFile.task_type;
  }

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdAt = ClDateHelper.getDate();
  }
}
