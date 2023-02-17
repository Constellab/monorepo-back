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
  updateContainers?: boolean;
  pruneSystem?: string;
}

export interface CnLabComposeRestartOptions extends CnLabComposeUpOptions{
  destroyContainers?: boolean; // if true container will be destroyed and recreated
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
  labManagerVersion: string;
  labManagerCompatibleVersionForCentral?: string; // version provided by central to tell the compatible version for the lab manager
}

/**
 * Object to config the lab manager required on init
 */
export interface CnLabManagerInitConfig {
  centralApiKey: string;
  codelabToken: string;
  centralFrontUrl: string;
  centralApiUrl: string;
  hubFrontUrl: string;
  gwsCoreProdPassword: string;
  gwsCoreDevPassword: string;
}


export interface CnLabManagerBrickVersionDTO {
  name: string;
  repo: string;
  repoType: 'PIP' | 'GIT';
  version: string;
  isHidden: boolean;
  technicalInfo: Record<string, string>;
}

export interface CnLabManagerConfigDTO {
  bricks: CnLabManagerBrickVersionDTO[];
  glabTag: 'latest' | 'beta' | string;
}
