export enum CnLabInstanceStatus {
  SERVER_STARTING = 'SERVER_STARTING',
  SERVER_STOPPING = 'SERVER_STOPPING',
  SERVER_RUNNING = 'SERVER_RUNNING', // server running but lab not yet
  SERVER_STOPPED = 'SERVER_STOPPED', // server stopped
  LAB_RUNNING = 'LAB_RUNNING', // server and lab running
  SERVER_NOT_CONFIGURED = 'SERVER_NOT_CONFIGURED', // has no labInstanceId nor volumeId
}

// list of statuses that are considered as temporary
export const cnLabInstanceTemporaryStatuses = [
  CnLabInstanceStatus.SERVER_STARTING,
  CnLabInstanceStatus.SERVER_STOPPING,
];

// list of statuses that are considered as running
export const cnLabInstanceRunningStatuses = [
  CnLabInstanceStatus.SERVER_STARTING,
  CnLabInstanceStatus.SERVER_STOPPING,
  CnLabInstanceStatus.SERVER_RUNNING,
  CnLabInstanceStatus.LAB_RUNNING,
];

export enum CnLabInstanceServerTaskStatus {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  NONE = 'NONE',
}
