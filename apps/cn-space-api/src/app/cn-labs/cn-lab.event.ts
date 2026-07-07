import { CnLabServerTaskStatus, CnLabStatus } from './status/cn-lab-status.enum';

export const CN_LAB_EVENT_NAME = 'cn-lab-event';

export interface CnLabStatusChangedEvent {
  type: 'LAB_STATUS_CHANGED';
  labId: string;
  oldStatus: CnLabStatus;
  newStatus: CnLabStatus;
}

export interface CnLabServerTaskStatusChangedEvent {
  type: 'LAB_SERVER_TASK_STATUS_CHANGED';
  labId: string;
  oldStatus: CnLabServerTaskStatus;
  newStatus: CnLabServerTaskStatus;
}

export type CnLabEvent = CnLabStatusChangedEvent | CnLabServerTaskStatusChangedEvent;
