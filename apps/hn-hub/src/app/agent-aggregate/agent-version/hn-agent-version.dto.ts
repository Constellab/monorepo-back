import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';
import { HnAgentDto } from '../agent/hn-agent.dto';
import { HnAgentVersion, HnAgentVersionState, HnAgentVersionType } from './hn-agent-version.entity';
import { HnTypingStyle } from '../../brick-aggregate/brick/hn-brick.dto';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

export class HnAgentVersionDto extends BlEntityWithIdDTO {
  version: number;
  agent: HnAgentDto;
  versionState: HnAgentVersionState;
  type: HnAgentVersionType;
  versionInfos: TeRichTextDTO;
  params: string | string[]| Record<string, any>;
  environment: string;
  code: string;
  createdAt: string;
  inputSpecs?: Record<string, any>;
  outputSpecs?: Record<string, any>;
  configSpecs?: Record<string, any>;
  style?: HnTypingStyle;

  constructor(agentVersion: HnAgentVersion) {
    super();
    this.id = agentVersion?.id;
    this.version = agentVersion?.version;
    if (agentVersion?.agent) this.agent = new HnAgentDto(agentVersion.agent);
    this.versionState = agentVersion?.versionState;
    this.type = agentVersion?.type;
    this.versionInfos = agentVersion?.getVersionInfoRichText().toJson();
    this.params = agentVersion?.params;
    this.environment = agentVersion?.environment;
    this.code = agentVersion?.code;
    this.createdAt = agentVersion?.createdAt?.toISO();
    this.inputSpecs = agentVersion?.inputSpecs;
    this.outputSpecs = agentVersion?.outputSpecs;
    this.configSpecs = agentVersion?.configSpecs;
    this.style = agentVersion?.style;
  }
}
