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
    // TODO : to remove once all lab manager are on version 2.11.0 or higher
    apiKey: string | null;
  };
  lab: {
    id: string;
    name: string;
    codelabToken: string | null;
    captchaSiteKey: string | null;
  };
  db: {
    gwsCoreProdPassword: string;
    gwsCoreDevPassword: string;
  };
  backup: {
    enable: boolean;
  };
  openaiApiKey: string | null;

  // @deprecated - to remove once all lab managers are on version 2.12.0 or higher
  codelabToken: string | null;
  // @deprecated - to remove once all lab managers are on version 2.12.0 or higher
  gwsCoreProdPassword: string;
  // @deprecated - to remove once all lab managers are on version 2.12.0 or higher
  gwsCoreDevPassword: string;
  // @deprecated - to remove once all lab managers are on version 2.12.0 or higher
  labConfig: {
    enableBackup: boolean;
  };
  // @deprecated - to remove once all lab managers are on version 2.12.0 or higher
  captchaSiteKey: string | null;
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

  adminerIsRunning!: boolean;

  version!: string;

  isConfigured!: boolean;
  isInitialized!: boolean;
  // version of the lab manager that has been used to init the lab
  lastInitVersion!: string;
  labFrontUrl!: string;
  labStatus!: 'STOPPED' | 'RUNNING' | 'STARTING' | 'ERROR';
  glabStatus!: {
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

/** How `pattern` is matched against a log line by the lab manager. */
export type CnLabManagerLogPatternMode = 'substring' | 'regex';

/**
 * Filters sent to the lab manager's `logs/search` route.
 *
 * The canonical contract is Constellab/lab-manager#11 — this mirrors the consumer side of
 * it, see `docs/specs/lab-manager-log-filtering.md`. The order of operations matters and
 * belongs to the lab manager: `pattern` is applied *before* `tail`, so `tail` means "the
 * last N lines that match" and not "the pattern within the last N lines". A container that
 * has been looping on an error for an hour returns nothing under the second reading.
 */
export interface CnLabManagerLogSearchQuery {
  tail?: number;
  since?: string;
  until?: string;
  pattern?: string;
  patternMode?: CnLabManagerLogPatternMode;
  caseSensitive?: boolean;
  contextLines?: number;
  errorsOnly?: boolean;
  maxBytes?: number;
}

/**
 * The `logs/search` response, plus the one field the space API adds itself.
 *
 * `filteredLocally` is not sent by the lab manager: it records that the route answered 404
 * and the space API fell back to tailing the blob from `logs`. A caller reading it knows
 * `pattern`, `since` and `contextLines` were not applied — silently ignoring them would let
 * an empty result read as "nothing matched".
 */
export interface CnLabManagerDockerLogSearch extends CnLabManagerDockerLogs {
  totalLines: number;
  matchedLines: number;
  returnedLines: number;
  truncated: boolean;
  truncatedBy?: string | null;
  window?: { from?: string | null; until?: string | null } | null;
  filteredLocally: boolean;
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
}

//////////////////////// DNS CHALLENGE ////////////////////////
export interface CnLabManagerCreateDnsChallenge {
  fqdn: string;
  value: string;
}

//////////////////////// MCP CONFIG ////////////////////////
export interface CnMcpConfigDTO {
  enabled: boolean;
}

//////////////////////// CUSTOM ENV VARIABLES ////////////////////////
export interface CnCustomEnvVariablesDTO {
  variables: Record<string, string>;
}

//////////////////////// BRICKS INFO ////////////////////////
/**
 * Info of a brick installed on the lab, as returned by the lab manager
 * `bricks-info` route (mirrors the community brick-info response).
 */
export interface CnBrickInfoDTO {
  id: string;
  name: string;
  description: string;
  imageLink: string | null;
  lastVersion: string;
  hasNewVersion: boolean;
}
