import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { TeRichText, TeRichTextDTO } from '@monorepo/te-text-editor';
import { DateTime } from 'luxon';
import { BeforeInsert, Column, Entity, ManyToOne, Unique } from 'typeorm';

import { HnTypingStyle } from '../../brick-aggregate/brick/hn-brick.dto';
import { HnAgentVersionFileInput } from '../agent/hn-agent.dto';
import { HnAgent } from '../agent/hn-agent.entity';

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
  STREAMLIT_PIP = 'STREAMLIT_PIP',
  STREAMLIT_CONDA = 'STREAMLIT_CONDA',
  STREAMLIT_MAMBA = 'STREAMLIT_MAMBA',
}

@Unique(['version', 'agent'])
@Entity('agent_version')
export class HnAgentVersion extends BlEntityWithId {
  @Column({ default: 1 })
  version: number;

  @BlNotUpdatable()
  @ManyToOne(() => HnAgent, { eager: true, onDelete: 'CASCADE', nullable: false })
  agent: HnAgent;

  @Column({ type: 'enum', enum: HnAgentVersionState, nullable: false, default: HnAgentVersionState.DRAFT })
  versionState: HnAgentVersionState;

  @Column({ type: 'enum', enum: HnAgentVersionType, nullable: false, default: HnAgentVersionType.PYTHON })
  type: HnAgentVersionType;

  @Column({ type: 'simple-json', nullable: true })
  versionInfos?: TeRichTextDTO;

  @Column({ type: 'simple-json', nullable: true })
  params: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  environment: string;

  @Column({ type: 'text', nullable: true })
  code: string;

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt: DateTime;

  @Column({ type: 'simple-json', nullable: true })
  inputSpecs?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  outputSpecs?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  configSpecs?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
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
