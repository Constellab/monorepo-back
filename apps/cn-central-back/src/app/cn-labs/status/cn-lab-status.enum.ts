export enum CnLabStatus {
  SERVER_STARTING = 'SERVER_STARTING', // server is starting in the cloud
  SERVER_STOPPING = 'SERVER_STOPPING', // server is stopping in the cloud
  SERVER_RUNNING = 'SERVER_RUNNING', // server running but lab manager and lab are not started (server not configured)
  SERVER_STOPPED = 'SERVER_STOPPED', // server stopped in the cloud (billing stopped)
  SERVER_CONFIGURED = 'SERVER_CONFIGURED', // server is started and lab manager is running
  LAB_RUNNING = 'LAB_RUNNING', // server and lab running
  NO_SERVER = 'NO_SERVER', // has no labId nor volumeId, no billing
  ERROR = 'ERROR', // error occurred
}

// list of statuses that are considered as temporary
export const cnLabTemporaryStatuses = [
  CnLabStatus.SERVER_STARTING,
  CnLabStatus.SERVER_STOPPING,
  CnLabStatus.SERVER_RUNNING,
  CnLabStatus.SERVER_CONFIGURED,
];

// list of statuses that are considered as running (everything except STOPPED, NO_SERVER and ERROR)
export const cnLabRunningStatuses = [
  CnLabStatus.SERVER_STARTING,
  CnLabStatus.SERVER_STOPPING,
  CnLabStatus.SERVER_RUNNING,
  CnLabStatus.SERVER_CONFIGURED,
  CnLabStatus.LAB_RUNNING,
];

// list of statuses that are considered as stopped
export const cnLabStoppedStatuses = [CnLabStatus.SERVER_STOPPED, CnLabStatus.NO_SERVER, CnLabStatus.ERROR];

export enum CnLabServerTaskStatus {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  NONE = 'NONE',
}
