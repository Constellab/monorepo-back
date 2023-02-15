import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';

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
  updateContainers?: boolean;
  pruneSystem?: boolean;
}

export interface CaLabComposeRestartOptions extends CaLabComposeUpOptions{
  destroyContainers?: boolean; // if true container will be destroyed and recreated
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

export class CaLabManagerBrickVersionDTO {
  name: string;
  version: string;
}

export class CaLabManagerConfig {
  brickVersions: CaLabManagerBrickVersionDTO[];
  glabTag: 'latest' | 'beta' | string;
}


////////////////////////////// BACKUP //////////////////////////
export class CaExternalLabBackup {
  status: 'IN_PROGRESS' | 'DONE' | 'ERROR';

  @Type(() => CaExternalLabBackupStorage)
  storages: CaExternalLabBackupStorage[];
  message?: string;
}

export class CaExternalLabBackupStorage {
  region: string;
  bucket: string;
  endpoint: string;

  @ClLuxonDateTimeTransform()
  startUploadAt: DateTime;

  @ClLuxonDateTimeTransform()
  endUploadAt?: DateTime;
  status: 'IN_PROGRESS' | 'DONE' | 'ERROR';
  message?: string;
}

export class CaExternalLabBackupHistory {
  version: number;

  @Type(() => CaExternalLabBackup)
  backups: CaExternalLabBackup[];
}
