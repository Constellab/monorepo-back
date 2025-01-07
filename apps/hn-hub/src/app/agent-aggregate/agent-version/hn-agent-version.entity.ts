import { BeforeInsert, Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { HnAgent } from '../agent/hn-agent.entity';
import { DateTime } from 'luxon';
import { ClDateHelper } from '@monorepo/core-lib';
import { HnAgentVersionFileInput } from '../agent/hn-agent.dto';
import { HnTypingStyle } from '../../brick-aggregate/brick/hn-brick.dto';
import { TeRichText, TeRichTextDTO } from '@monorepo/te-text-editor';

export enum HnAgentVersionState {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

export enum HnAgentVersionType {
  PYTHON = 'PYTHON',
  CONDA_PYTHON = 'CONDA_PYTHON',
  MAMBA_PYTHON = 'MAMBA_PYTHON',
  PIP_PYTHON = 'PIP_PYTHON',
  CONDA_R = 'CONDA_R',
  MAMBA_R = 'MAMBA_R',
  STREAMLIT = 'STREAMLIT',
}

@Unique(['version', 'agent'])
@Entity('agent_version')
export class HnAgentVersion extends BlEntityWithId {
  @Column({ default: 1 })
  version: number;

  @BlNotUpdatable()
  @ManyToOne(() => HnAgent, { eager: true, onDelete: 'CASCADE' })
  agent: HnAgent;

  @Column({ type: 'enum', enum: HnAgentVersionState, nullable: false, default: HnAgentVersionState.DRAFT })
  versionState: HnAgentVersionState;

  @Column({ type: 'enum', enum: HnAgentVersionType, nullable: false, default: HnAgentVersionType.PYTHON })
  type: HnAgentVersionType;

  @Column({ name: 'versionInfos', type: 'simple-json', nullable: true })
  versionInfos?: TeRichTextDTO;

  @Column({ type: 'simple-json', nullable: true })
  params: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  environment: string;

  @Column({ type: 'text', nullable: true })
  code: string;

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt: DateTime;

  @Column({ name: 'inputSpecs', type: 'simple-json', nullable: true })
  inputSpecs?: Record<string, any>;

  @Column({ name: 'outputSpecs', type: 'simple-json', nullable: true })
  outputSpecs?: Record<string, any>;

  @Column({ name: 'configSpecs', type: 'simple-json', nullable: true })
  configSpecs?: Record<string, any>;

  @Column({ name: 'style', type: 'simple-json', nullable: true })
  style?: HnTypingStyle;

  initVersion(agent: HnAgent, versionFile: HnAgentVersionFileInput): void {
    this.agent = agent;
    this.versionState = HnAgentVersionState.DRAFT;
    this.version = 1;
    this.initVersionFile(versionFile);
  }

  initNewDraftVersion(
    lastAgentVersion: HnAgentVersion,
    versionFile: HnAgentVersionFileInput,
    replace = false
  ): void {
    this.version = lastAgentVersion.version + (replace ? 0 : 1);
    this.agent = lastAgentVersion.agent;
    this.versionState = HnAgentVersionState.DRAFT;
    this.initVersionFile(versionFile);
  }

  private initVersionFile(versionFile: HnAgentVersionFileInput): void {
    this.code = versionFile.code;
    this.params = versionFile.params as Record<string, any>;
    this.inputSpecs = versionFile.input_specs;
    this.outputSpecs = versionFile.output_specs;
    this.configSpecs = versionFile.config_specs;
    this.environment = versionFile.environment;
    this.type = versionFile.task_type;
    this.style = versionFile.style;
  }

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdAt = ClDateHelper.getDate();
  }

  getVersionInfoRichText(): TeRichText {
    return new TeRichText(this.versionInfos);
  }

  setVersionInfoRichText(versionInfos: TeRichText): void {
    this.versionInfos = versionInfos.toJson();
  }
}
