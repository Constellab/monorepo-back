export enum CnLabInstanceStatus {
  SERVER_STARTING = 'SERVER_STARTING',
  SERVER_STOPPING = 'SERVER_STOPPING',
  SERVER_RUNNING = 'SERVER_RUNNING', // server running but lab not yet
  SERVER_STOPPED = 'SERVER_STOPPED', // server stopped
  BACKING_UP_BEFORE_STOP = 'BACKING_UP_BEFORE_STOP', // status for the bd is being backed up before stopping the server
  LAB_RUNNING = 'LAB_RUNNING', // server and lab running
}

// list of statuses that are considered as temporary
export const cnLabInstanceTemporaryStatuses = [
  CnLabInstanceStatus.SERVER_STARTING,
  CnLabInstanceStatus.SERVER_STOPPING,
  CnLabInstanceStatus.BACKING_UP_BEFORE_STOP
];
