
export interface CnLabDockerPs {
  names: string;
  state: 'running' | 'exited';
}


export interface CnLabDockerPsFull extends CnLabDockerPs{
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

export interface CnLabPullBiotaOptions {
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
