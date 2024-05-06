import {CnLabInstanceServerTaskStatus, CnLabInstanceStatus} from './status/cn-lab-instance-status.enum';

export const cnLabInstanceEventName = 'cn-lab-instance-event';


export interface CnLabStatusChangedEvent {
  type: 'LAB_STATUS_CHANGED';
  labInstanceId: string;
  oldStatus: CnLabInstanceStatus;
  newStatus: CnLabInstanceStatus;
}

export interface CnLabServerTaskStatusChangedEvent {
  type: 'LAB_SERVER_TASK_STATUS_CHANGED';
  labInstanceId: string;
  oldStatus: CnLabInstanceServerTaskStatus;
  newStatus: CnLabInstanceServerTaskStatus;
}

export type CnLabEvent  = CnLabStatusChangedEvent | CnLabServerTaskStatusChangedEvent;
