import {BlEntityWithIdDTO} from '@monorepo/back-core-lib';
import {HnLiveTaskDto} from '../live-task/hn-live-task.dto';
import {HnLiveTaskVersion, HnLiveTaskVersionState, HnLiveTaskVersionType} from './hn-live-task-version.entity';

export class HnLiveTaskVersionDto extends BlEntityWithIdDTO {
  version: number;
  liveTask: HnLiveTaskDto;
  versionState: HnLiveTaskVersionState;
  type: HnLiveTaskVersionType;
  versionInfos?: Record<string, any>;
  params: string;
  environment: string;
  code: string;
  createdAt: string;
  inputSpecs?: Record<string, any>;
  outputSpecs?: Record<string, any>;
  configSpecs?: Record<string, any>;

  constructor(liveTaskVersion: HnLiveTaskVersion) {
    super();
    this.id = liveTaskVersion?.id;
    this.version = liveTaskVersion?.version;
    if (liveTaskVersion?.liveTask)
      this.liveTask = new HnLiveTaskDto(liveTaskVersion.liveTask);
    this.versionState = liveTaskVersion?.versionState;
    this.type = liveTaskVersion?.type;
    this.versionInfos = liveTaskVersion?.versionInfos;
    this.params = liveTaskVersion?.params;
    this.environment = liveTaskVersion?.environment;
    this.code = liveTaskVersion?.code;
    this.createdAt = liveTaskVersion?.createdAt?.toISO();
    this.inputSpecs = liveTaskVersion?.inputSpecs;
    this.outputSpecs = liveTaskVersion?.outputSpecs;
    this.configSpecs = liveTaskVersion?.configSpecs;
  }
}
