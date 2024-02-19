import {HnSpace} from '../../space-aggregate/space/hn-space.entity';
import {HnLiveTaskVersion, HnLiveTaskVersionType} from '../live-task-version/hn-live-task-version.entity';
import {HnLiveTask} from './hn-live-task.entity';

export class HnCreateLiveTaskDto {
  title: string;
  space?: HnSpace;
  versionFile: HnLiveTaskVersionFileInput;
}

export class HnLiveTaskVersionFileInputBrick{
  name: string;
  version: string;
}

export class HnLiveTaskVersionFileInput{
  json_version: number;
  params: string[];
  code: string;
  environment: string;
  input_specs: Record<string, any>;
  output_specs: Record<string, any>;
  config_specs: Record<string, any>;
  bricks: HnLiveTaskVersionFileInputBrick[];
  task_type: HnLiveTaskVersionType;
}

export interface HnLiveTaskLabSpaceDto{
  id: string;
  name: string;
}

export class HnLiveTaskForLabDto{
  id: string;
  title: string;
  space?: HnLiveTaskLabSpaceDto;
  created_at?: string;
  last_modified_at?: string;
  created_by?: any;
  description?: Record<string, any>;
  latest_publish_version: number;

  static fromLiveTask(liveTask: HnLiveTask): HnLiveTaskForLabDto{
    const dto = new HnLiveTaskForLabDto();
    dto.id = liveTask.id;
    dto.title = liveTask.title;
    dto.created_at = liveTask.createdAt.toISO();
    dto.last_modified_at = liveTask.lastModifiedAt.toISO();
    dto.created_by = liveTask.createdBy;
    dto.description = liveTask.description;
    dto.latest_publish_version = liveTask.latestPublishVersion;
    if (liveTask.space == null) return dto;
    dto.space = {
      id: liveTask.space.id,
      name: liveTask.space.name
    };
    return dto;
  }
}

export class HnLiveTaskVersionForLabDto{
  id: string;
  version: number;
  type: string;
  environment: string;
  params: string[];
  code: string;
  input_specs: Record<string, any>;
  output_specs: Record<string, any>;
  config_specs: Record<string, any>;
  live_task: HnLiveTaskForLabDto;

  static fromLiveTaskVersion(liveTaskVersion: HnLiveTaskVersion): HnLiveTaskVersionForLabDto{
    const dto = new HnLiveTaskVersionForLabDto();
    dto.id = liveTaskVersion.id;
    dto.version = liveTaskVersion.version;
    switch (liveTaskVersion.type){
      case 'CONDA_R':
        dto.type = 'TASK.gws_core.RCondaLiveTask';
        break;
      case 'MAMBA_R':
        dto.type = 'TASK.gws_core.RMambaLiveTask';
        break;
      case 'CONDA_PYTHON':
        dto.type = 'TASK.gws_core.PyCondaLiveTask';
        break;
      case 'MAMBA_PYTHON':
        dto.type = 'TASK.gws_core.PyMambaLiveTask';
        break;
      case 'PIP_PYTHON':
        dto.type = 'TASK.gws_core.PyPipenvLiveTask';
        break;
      case 'PYTHON':
        dto.type = 'TASK.gws_core.PyLiveTask';
        break;
    }
    dto.environment = liveTaskVersion.environment? liveTaskVersion.environment : null;
    dto.code = liveTaskVersion.code;
    dto.params = liveTaskVersion.params;
    dto.input_specs = liveTaskVersion.inputSpecs;
    dto.output_specs = liveTaskVersion.outputSpecs;
    dto.config_specs = liveTaskVersion.configSpecs;
    dto.live_task = {
      id: liveTaskVersion.liveTask.id,
      title: liveTaskVersion.liveTask.title,
      latest_publish_version: liveTaskVersion.liveTask.latestPublishVersion
    };
    return dto;
  }
}
