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

export interface CaLabPullBiotaOptions {
  forceUpdate?: boolean;
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

  version: string;
  biota: {
    exists: boolean;
    dbUrl ?: string;
  };
  isConfigured: boolean;
  isInitialized: boolean;
  // version of the lab manager that has been used to init the lab
  lastInitVersion: string;
}

export class CaLabManagerRecommendedVersion{
  labManagerRecommendedVersion: string;
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

export type CaExternalLabBackupStatus = 'IN_PROGRESS' | 'DONE' | 'ERROR';

export interface CaExternalLabBackupStatusObject {
  status: CaExternalLabBackupStatus
  message: string;
}

export class CaExternalLabBackup {
  status: CaExternalLabBackupStatus;

  @Type(() => CaExternalLabBackupStorage)
  storages: CaExternalLabBackupStorage[];
}

export class CaExternalLabBackupStorage {
  region: string;
  bucket: string;
  endpoint: string;

  @ClLuxonDateTimeTransform()
  startUploadAt: DateTime;

  @ClLuxonDateTimeTransform()
  endUploadAt?: DateTime;
  status: CaExternalLabBackupStatus;

  dataStatus: CaExternalLabBackupStatusObject;
  dbStatus: CaExternalLabBackupStatusObject;
}

export class CaExternalLabBackupHistory {
  version: number;

  @Type(() => CaExternalLabBackup)
  backups: CaExternalLabBackup[];
}
