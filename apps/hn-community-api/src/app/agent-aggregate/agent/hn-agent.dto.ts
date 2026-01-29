import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

import { HnTypingStyle } from '../../brick-aggregate/brick/hn-brick.dto';
import { HnSpaceDto, HnSpaceForLabDto } from '../../space-aggregate/space/hn-space.dto';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { HnUserDto } from '../../users/hn-user.dto';
import { HnAgentCoAuthorDto } from '../agent-co-author/hn-agent-co-author.dto';
import { HnAgentVersionDto } from '../agent-version/hn-agent-version.dto';
import { HnAgentVersionType } from '../agent-version/hn-agent-version.entity';
import { HnAgent } from './hn-agent.entity';

export class HnAgentDto extends BlEntityWithIdDTO {
  title: string;
  description: TeRichTextDTO;
  latestPublishVersion?: number;
  space?: HnSpaceDto;
  createdAt?: string;
  createdBy?: HnUserDto;
  lastModifiedAt?: string;
  lastModifiedBy?: HnUserDto;
  parentAgentVersionId?: string;
  likes?: number;
  comments?: number;
  agentCoAuthors?: HnAgentCoAuthorDto[];
  latestStyle?: HnTypingStyle;

  constructor(agent: HnAgent) {
    super();
    if (!agent) return;
    this.id = agent.id;
    this.title = agent.title;
    this.description = agent.getDescriptionRichText().toJson();
    this.latestPublishVersion = agent.latestPublishVersion;
    this.space = agent.space ? new HnSpaceDto(agent.space) : null;
    this.createdAt = agent.createdAt.toISO();
    this.createdBy = new HnUserDto(agent.createdBy);
    this.lastModifiedAt = agent.lastModifiedAt.toISO();
    this.lastModifiedBy = new HnUserDto(agent.lastModifiedBy);
    this.parentAgentVersionId = agent.parentAgentVersionId;
    this.likes = agent.likes;
    this.comments = agent.comments;
    this.agentCoAuthors = agent.agentCoAuthors?.map((agentCoAuthor) => new HnAgentCoAuthorDto(agentCoAuthor));
    this.latestStyle = agent.latestStyle;
  }
}

export class HnCreateAgentDto {
  title: string;
  space?: HnSpace;
  versionFile: HnAgentVersionFileInput;
}

export class HnAgentVersionFileInputBrick {
  name: string;
  version: string;
}

export class HnAgentVersionFileInput {
  json_version: number;
  params: string | string[] | Record<string, any>;
  code: string;
  environment: string;
  input_specs: Record<string, any>;
  output_specs: Record<string, any>;
  config_specs: Record<string, any>;
  bricks: HnAgentVersionFileInputBrick[];
  task_type: HnAgentVersionType;
  style?: HnTypingStyle;
}

export class HnAgentForLabDto {
  id: string;
  title: string;
  space?: HnSpaceForLabDto;
  created_at?: string;
  last_modified_at?: string;
  created_by?: HnUserDto;
  description?: TeRichTextDTO;
  latest_publish_version: number;
  latest_style?: HnTypingStyle;
  agent_co_authors?: HnUserDto[];
  likes?: number;
  comments?: number;

  static fromAgentDto(agentDto: HnAgentDto): HnAgentForLabDto {
    const dto = new HnAgentForLabDto();
    dto.id = agentDto.id;
    dto.title = agentDto.title;
    dto.created_at = agentDto.createdAt;
    dto.last_modified_at = agentDto.lastModifiedAt;
    dto.created_by = agentDto.createdBy;
    dto.description = agentDto.description;
    dto.latest_publish_version = agentDto.latestPublishVersion;
    dto.latest_style = agentDto.latestStyle;
    dto.likes = agentDto.likes;
    dto.comments = agentDto.comments;
    if (agentDto.space == null) return dto;
    dto.space = {
      id: agentDto.space.id,
      name: agentDto.space.name,
    };
    dto.agent_co_authors = agentDto.agentCoAuthors?.map((agentCoAuthor) => agentCoAuthor.user);
    return dto;
  }
}

export class HnAgentVersionForLabDto {
  id: string;
  version: number;
  type: string;
  environment: string;
  params: string | string[] | Record<string, any>;
  code: string;
  input_specs: Record<string, any>;
  output_specs: Record<string, any>;
  config_specs: Record<string, any>;
  agent: HnAgentForLabDto;
  style?: HnTypingStyle;

  static fromAgentVersionDto(agentVersion: HnAgentVersionDto): HnAgentVersionForLabDto {
    const dto = new HnAgentVersionForLabDto();
    dto.id = agentVersion.id;
    dto.version = agentVersion.version;
    switch (agentVersion.type) {
      case HnAgentVersionType.CONDA_R:
        dto.type = HnAgentTyping.CONDA_R;
        break;
      case HnAgentVersionType.MAMBA_R:
        dto.type = HnAgentTyping.MAMBA_R;
        break;
      case HnAgentVersionType.CONDA_PYTHON:
        dto.type = HnAgentTyping.CONDA_PYTHON;
        break;
      case HnAgentVersionType.MAMBA_PYTHON:
        dto.type = HnAgentTyping.MAMBA_PYTHON;
        break;
      case HnAgentVersionType.PIP_PYTHON:
        dto.type = HnAgentTyping.PIP_PYTHON;
        break;
      case HnAgentVersionType.PYTHON:
        dto.type = HnAgentTyping.PYTHON;
        break;
      case HnAgentVersionType.STREAMLIT:
        dto.type = HnAgentTyping.STREAMLIT;
        break;
      case HnAgentVersionType.STREAMLIT_CONDA:
        dto.type = HnAgentTyping.STREAMLIT_CONDA;
        break;
      case HnAgentVersionType.STREAMLIT_PIP:
        dto.type = HnAgentTyping.STREAMLIT_PIP;
        break;
      case HnAgentVersionType.STREAMLIT_MAMBA:
        dto.type = HnAgentTyping.STREAMLIT_MAMBA;
        break;
    }
    dto.environment = agentVersion.environment ? agentVersion.environment : null;
    dto.code = agentVersion.code;
    dto.params = agentVersion.params;
    dto.input_specs = agentVersion.inputSpecs;
    dto.output_specs = agentVersion.outputSpecs;
    dto.config_specs = agentVersion.configSpecs;
    dto.agent = {
      id: agentVersion.agent.id,
      title: agentVersion.agent.title,
      latest_publish_version: agentVersion.agent.latestPublishVersion,
    };
    dto.style = agentVersion.style;
    return dto;
  }
}

export enum HnAgentTyping {
  CONDA_R = 'TASK.gws_core.RCondaAgent',
  MAMBA_R = 'TASK.gws_core.RMambaAgent',
  CONDA_PYTHON = 'TASK.gws_core.PyCondaAgent',
  MAMBA_PYTHON = 'TASK.gws_core.PyMambaAgent',
  PIP_PYTHON = 'TASK.gws_core.PyPipenvAgent',
  PYTHON = 'TASK.gws_core.PyAgent',
  STREAMLIT = 'TASK.gws_core.StreamlitAgent',
  STREAMLIT_CONDA = 'TASK.gws_core.StreamlitCondaAgent',
  STREAMLIT_PIP = 'TASK.gws_core.StreamlitPipenvAgent',
  STREAMLIT_MAMBA = 'TASK.gws_core.StreamlitMambaAgent',
}

export class HnCreateAgentVersionFromLabResponseDto {
  agent_version: string;
  title: string;
  id: string;
}

export class HnCreateAgentVersionFromLabResponseDtoOldFormat {
  live_task_version: string;
  title: string;
  id: string;

  constructor(createAgentVersionResponse: HnCreateAgentVersionFromLabResponseDto) {
    this.live_task_version = createAgentVersionResponse.agent_version;
    this.title = createAgentVersionResponse.title;
    this.id = createAgentVersionResponse.id;
  }
}

export interface HnAgentEditStyleData {
  isVersion: boolean;
  allVersionsChecked: boolean;
  style: HnTypingStyle;
}

export class HnAgentVersionForLabDtoOldFormat {
  id: string;
  version: number;
  type: string;
  environment: string;
  params: string | string[] | Record<string, any>;
  code: string;
  input_specs: Record<string, any>;
  output_specs: Record<string, any>;
  config_specs: Record<string, any>;
  live_task: HnAgentForLabDto;
  style?: HnTypingStyle;

  constructor(agentVersion: HnAgentVersionForLabDto) {
    this.id = agentVersion.id;
    this.version = agentVersion.version;
    this.type = agentVersion.type.replace('Agent', 'LiveTask');
    this.environment = agentVersion.environment;
    this.params = agentVersion.params;
    this.code = agentVersion.code;
    this.input_specs = agentVersion.input_specs;
    this.output_specs = agentVersion.output_specs;
    this.config_specs = agentVersion.config_specs;
    this.live_task = agentVersion.agent;
    this.style = agentVersion.style;
  }
}
