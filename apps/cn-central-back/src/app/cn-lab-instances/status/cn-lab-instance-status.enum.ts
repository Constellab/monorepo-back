export enum CnLabInstanceStatus {
  SERVER_STARTING = 'SERVER_STARTING', // server is starting in the cloud
  SERVER_STOPPING = 'SERVER_STOPPING', // server is stopping in the cloud
  SERVER_RUNNING = 'SERVER_RUNNING', // server running but lab manager and lab are not started (server not configured)
  SERVER_STOPPED = 'SERVER_STOPPED', // server stopped in the cloud (billing stopped)
  SERVER_CONFIGURED = 'SERVER_CONFIGURED', // server is started and lab manager is running
  LAB_RUNNING = 'LAB_RUNNING', // server and lab running
  NO_SERVER = 'NO_SERVER', // has no labInstanceId nor volumeId, no billing
  ERROR = 'ERROR', // error occurred
}

// list of statuses that are considered as temporary
export const cnLabInstanceTemporaryStatuses = [
  CnLabInstanceStatus.SERVER_STARTING,
  CnLabInstanceStatus.SERVER_STOPPING,
  CnLabInstanceStatus.SERVER_RUNNING,
  CnLabInstanceStatus.SERVER_CONFIGURED,
];

// list of statuses that are considered as running (everything except STOPPED and NO_SERVER)
export const cnLabInstanceRunningStatuses = [
  CnLabInstanceStatus.SERVER_STARTING,
  CnLabInstanceStatus.SERVER_STOPPING,
  CnLabInstanceStatus.SERVER_RUNNING,
  CnLabInstanceStatus.SERVER_CONFIGURED,
  CnLabInstanceStatus.LAB_RUNNING,
];

// list of statuses that are considered as stopped
export const cnLabInstanceStoppedStatuses = [
  CnLabInstanceStatus.SERVER_STOPPED,
  CnLabInstanceStatus.NO_SERVER,
  CnLabInstanceStatus.ERROR,
];

export enum CnLabInstanceServerTaskStatus {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  NONE = 'NONE',
}
