import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';

export type CaLabContainersStatus = 'STOP' | 'DOWN' | 'UP' | 'PARTIALLY_UP';

const caLabContainersStatusDict: FlStatusDict<CaLabContainersStatus> = {
  STOP: FlStatusHelper.getErrorStatus('STOP', 'lab_containers_stopped', 'stop'),
  DOWN: FlStatusHelper.getErrorStatus('DOWN', 'lab_containers_down'),
  UP: FlStatusHelper.getSuccessStatus('UP', 'lab_containers_up'),
  PARTIALLY_UP: FlStatusHelper.getWarningStatus('PARTIALLY_UP', 'lab_containers_partially_up')
};


export class CaLabContainerStatusInfo {

  @FlStatusTransform(caLabContainersStatusDict)
  status: FlStatus<CaLabContainersStatus>;

  info?: string;
}

export type caLabDockerState = 'created' | 'running' | 'exited';

const caLabDockerStateDict: FlStatusDict<caLabDockerState> = {
  created: FlStatusHelper.getWarningStatus('created', 'lab_container_created'),
  running: FlStatusHelper.getSuccessStatus('running', 'lab_container_running'),
  exited: FlStatusHelper.getErrorStatus('exited', 'lab_container_exited'),
};

export class CaLabDockerPs {
  command: string;
  id: string;
  image: string;
  mounts: string;
  names: string;
  networks: string;
  ports: string;
  runningFor: string;
  size: string;

  @FlStatusTransform(caLabDockerStateDict)
  state: FlStatus<caLabDockerState>;
  status: string;
}

export interface CaLabComposeUpOptions {
  updateBricks?: boolean;
  updateContainers?: boolean;
}

export type CaLabTaskStatus = 'RUNNING' | 'SUCCESS' | 'ERROR';

const caLabTaskStatusDict: FlStatusDict<CaLabTaskStatus> = {
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR')
};

export class CaLabTaskStatusInfo {
  name: string;

  @FlStatusTransform(caLabTaskStatusDict)
  status: FlStatus<CaLabTaskStatus>;
  info?: string;
}

export class CaLabManagerStatus {
  @Type(() => CaLabContainerStatusInfo)
  containersStatus: CaLabContainerStatusInfo;

  @Type(() => CaLabTaskStatusInfo)
  currentTask?: CaLabTaskStatusInfo;

  adminerIsRunning: boolean;
}

export class CaBrickVersionDTO {
  name: string;
  version: string;
  isHidden: boolean;
}

export class CaLabInstanceConfig {
  brickVersions: CaBrickVersionDTO[];
}
