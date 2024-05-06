/**
 * File that contains all the DTO to communicate with the lab manager
 */
export interface CnLabManagerDockerPs {
  names: string;
  state: 'running' | 'exited';
}


export interface CnLabManagerDockerPsFull extends CnLabManagerDockerPs{
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



export interface CnLabManagerComposeUpOptions {
  updateContainers?: boolean;
  pruneSystem?: string;
}

export interface CnManagerLabComposeRestartOptions extends CnLabManagerComposeUpOptions{
  destroyContainers?: boolean; // if true container will be destroyed and recreated
}

export interface CnManagerLabPullBiotaOptions {
  forceUpdate?: boolean;
}


/**
 * Object to config the lab manager required on init
 */
export interface CnLabManagerInitConfig {
  centralApiKey: string;
  codelabToken: string;
  centralFrontUrl: string;
  centralApiUrl: string;
  communityFrontUrl: string;
  communityApiUrl: string;
  communityApiKey: string;
  gwsCoreProdPassword: string;
  gwsCoreDevPassword: string;
  dockerRegistry: {
    url: string;
    username: string;
    password: string;
  }
  labConfig: {
    enableBackup: boolean;
  }
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
}
