export enum CnLabInstanceStatus {
  SERVER_STARTING = 'SERVER_STARTING',
  SERVER_STOPPING = 'SERVER_STOPPING',
  SERVER_RUNNING = 'SERVER_RUNNING', // server running but lab not yet
  SERVER_STOPPED = 'SERVER_STOPPED', // server stopped
  LAB_RUNNING = 'LAB_RUNNING', // server and lab running
}
