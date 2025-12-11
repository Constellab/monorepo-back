import { BlBucketConfig } from '@monorepo/back-core-lib';

import { CnLabBackupFrequency } from '../../cn-labs/backup/cn-lab-backup.dto';

/**
 * File that contains all the DTO to communicate with the lab manager
 */
export interface CnLabManagerDockerPs {
  names: string;
  state: 'running' | 'exited';
}

export interface CnLabManagerDockerInspect {
  names: string;
  status: 'running' | 'stopped' | 'error' | 'none';
  exitCode: number;
  image: string;
  startedAt: string;
}

export interface CnLabManagerDockerPsFull extends CnLabManagerDockerPs {
  command: string;
  createdAt: string;
  id: string;
  image: string;
  mounts: string;
  names: string;
  networks: string;
  ports: string;
  runningFor: string;
  state: 'running' | 'exited';
  status: string;
}

export enum CnLabManagerComposeEnv {
  DEV = 'dev',
  PROD = 'prod',
  ALL = 'all',
  NONE = 'none',
}

/*
 * Object to uniquely identify a docker-compose instance
 */
export interface CnLabManagerDockerComposeUniqueId {
  brickName: string;
  uniqueName: string;
  env: CnLabManagerComposeEnv;
}

export interface CnLabManagerComposeInfo {
  brickName: string;
  uniqueName: string;
  env: CnLabManagerComposeEnv;
  composeFilePath: string;
  description?: string;
}

export interface CnLabManagerComposeList {
  composes: CnLabManagerComposeInfo[];
}

export interface CnLabManagerContainerSize {
  size: string;
}

export interface CnLabManagerComposeUpOptions {
  updateContainers?: boolean;
  services?: string[];
}

export interface CnManagerLabComposeRestartOptions extends CnLabManagerComposeUpOptions {
  destroyContainers?: boolean; // if true container will be destroyed and recreated
}

export interface CnManagerLabPullBiotaOptions {
  forceUpdate?: boolean;
}

export interface CnLabManagerCleanOptions {
  removeErrorSubComposes: boolean;
  pruneSystem: boolean;
}

/**
 * Object to config the lab manager required on init
 */
export interface CnLabManagerInitConfig {
  space: {
    prodApiKey: string;
    devApiKey: string;
    frontUrl: string;
    apiUrl: string;
  };
  community: {
    frontUrl: string;
    apiUrl: string;
    apiKey: string;
  };
  codelabToken: string;
  gwsCoreProdPassword: string;
  gwsCoreDevPassword: string;
  labConfig: {
    enableBackup: boolean;
  };
  captchaSiteKey: string;
  openaiApiKey: string;
}

export interface CnLabManagerTaskStatusInfo {
  name: string;
  status: 'RUNNING' | 'SUCCESS' | 'ERROR';
  info?: string;
}

/**
 * Complete status of the lab manager
 */
export class CnLabManagerStatus {
  containersStatus: any;

  currentTask?: CnLabManagerTaskStatusInfo;

  adminerIsRunning: boolean;

  version: string;
  biota: {
    exists: boolean;
    dbUrl?: string;
  };
  isConfigured: boolean;
  isInitialized: boolean;
  // version of the lab manager that has been used to init the lab
  lastInitVersion: string;
  labFrontUrl: string;
  labStatus: 'STOPPED' | 'RUNNING' | 'STARTING' | 'ERROR';
  glabStatus: {
    status: 'running' | 'stopped' | 'error' | 'none';
    startProgress?: {
      percent: number;
      message: string;
    };
    hasStartError: boolean;
  };
}

export interface CnLabManagerErrorLogs {
  mainErrors: string[];
  logs: string;
}

export interface CnLabManagerDockerLogs {
  logs: string;
}

////////////////////////// BACKUP //////////////////////////
export interface CnLabManagerBackupInfoDTO {
  version: number;
  backupBuckets: CnLabManagerBackupBucketDTO[];
  s3Prefix: string;
}

export interface CnLabManagerBackupBucketDTO {
  backupFrequency: CnLabBackupFrequency;
  bucketConfig: BlBucketConfig;
}

export interface CnLabManagerRestoreBackupConfigDTO {
  restoreDb: boolean;
  restoreData: boolean;
  force: boolean;
  destinationLabId: string;
}

export interface CnLabManagerRestoreBackupDTO {
  version: number;
  bucketConfig: BlBucketConfig;
  s3Prefix: string;
  options: {
    restoreDb: boolean;
    restoreData: boolean;
    force: boolean;
  };
}

///////////////////////////// ADMINER /////////////////////////////
export interface CnLabManagerAdminerDbInfo {
  host: string;
  username: string;
  password: string;
  dbName: string;
}

export interface CnLabManagerAdminerInfo {
  url: string;

  gwsCoreProd: CnLabManagerAdminerDbInfo;
  gwsCoreDev: CnLabManagerAdminerDbInfo;
  gwsBiota: CnLabManagerAdminerDbInfo;
}

//////////////////////// DNS CHALLENGE ////////////////////////
export interface CnLabManagerCreateDnsChallenge {
  fqdn: string;
  value: string;
}
