import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

import { HnTypingStyle } from '../../brick-aggregate/brick/hn-brick.dto';
import { HnAgentDto } from '../agent/hn-agent.dto';
import { HnAgentVersion, HnAgentVersionState, HnAgentVersionType } from './hn-agent-version.entity';

export class HnAgentVersionDto extends BlEntityWithIdDTO {
  version!: number;
  agent!: HnAgentDto;
  versionState!: HnAgentVersionState;
  type!: HnAgentVersionType;
  versionInfos!: TeRichTextDTO;
  params!: string | string[] | Record<string, any>;
  environment!: string;
  code!: string;
  createdAt!: string | null;
  inputSpecs?: Record<string, any> | null;
  outputSpecs?: Record<string, any> | null;
  configSpecs?: Record<string, any> | null;
  style?: HnTypingStyle | null;

  constructor(agentVersion: HnAgentVersion) {
    super();
    this.assignBaseFields(agentVersion);
    this.assignContentFields(agentVersion);
    this.assignSpecsFields(agentVersion);
  }

  private assignBaseFields(agentVersion: HnAgentVersion): void {
    this.id = agentVersion?.id;
    this.version = agentVersion?.version;
    if (agentVersion?.agent) this.agent = new HnAgentDto(agentVersion.agent);
    this.versionState = agentVersion?.versionState;
    this.type = agentVersion?.type;
    this.versionInfos = agentVersion?.getVersionInfoRichText().toJson();
  }

  private assignContentFields(agentVersion: HnAgentVersion): void {
    this.params = agentVersion?.params;
    this.environment = agentVersion?.environment;
    this.code = agentVersion?.code;
    this.createdAt = agentVersion?.createdAt?.toISO() ?? null;
  }

  private assignSpecsFields(agentVersion: HnAgentVersion): void {
    this.inputSpecs = agentVersion?.inputSpecs;
    this.outputSpecs = agentVersion?.outputSpecs;
    this.configSpecs = agentVersion?.configSpecs;
    this.style = agentVersion?.style;
  }
}
