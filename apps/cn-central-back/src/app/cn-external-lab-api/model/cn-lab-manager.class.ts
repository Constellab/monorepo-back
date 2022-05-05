export type CnLabContainersStatus = 'STOP' | 'DOWN' | 'UP' | 'PARTIALLY_UP'

export interface CnLabContainerStatusInfo {
  status: CnLabContainersStatus;
  info?: string;
}

export interface CnLabDockerPs {
  command: string;
  createdAt: string;
  id: string;
  image: string;
  mounts: string;
  names: string;
  networks: string;
  ports: string;
  runningFor: string;
  size: string;
  state: 'running' | 'exited';
  status: string;
}


export interface CnLabComposeUpOptions {
  updateBricks?: boolean;
  updateContainers?: boolean;
  pruneSystem?: string;
}

export type CnLabTaskStatus = 'RUNNING' | 'SUCCESS' | 'ERROR';

export interface CnLabTaskStatusInfo {
  name: string;
  status: CnLabTaskStatus;
  info?: string;
}

export interface CnLabManagerStatus {
  containersStatus: CnLabContainerStatusInfo;
  currentTask?: CnLabTaskStatusInfo;
  adminerIsRunning: boolean;
}

/**
 * Object to config the lab manager required on init
 */
export interface CnLabManagerInitConfig {
  centralApiKey: string;
  codelabToken: string;
}

/**
 * Object to communicate with lab manager to update the config
 */
export interface CnLabManagerUpdateConfigDTO {
  labName: string;
  frontVersion: string;
  bricks: CnLabManagerBrickVersionDTO[];
}

export interface CnLabManagerBrickVersionDTO {
  name: string;
  repo: string;
  repoType: 'PIP' | 'GIT';
  version: string;
  isHidden: boolean;
}

export interface CnLabManagerConfigDTO {
  bricks: CnLabManagerBrickVersionDTO[];
}
