import {HnSpace} from '../../space-aggregate/space/hn-space.entity';
import {DateTime} from 'luxon';
import {HnLiveTaskVersionType} from '../live-task-version/hn-live-task-version.entity';

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
  code: string;
  environment: string;
  input_specs: Record<string, any>;
  output_specs: Record<string, any>;
  config_specs: Record<string, any>;
  bricks: HnLiveTaskVersionFileInputBrick[];
  task_type: HnLiveTaskVersionType;
}
