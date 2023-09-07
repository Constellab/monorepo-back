import {CnLabInstanceStatus} from './status/cn-lab-instance-status.enum';

export const cnLabInstanceEventName = 'cn-lab-instance-event';

export type CnLabInstanceEventType =
  'LAB_STATUS_CHANGED';

export interface CnLabInstanceStatusChangedEvent {
  type: CnLabInstanceEventType;
  labInstanceId: string;
  oldStatus: CnLabInstanceStatus;
  newStatus: CnLabInstanceStatus;
}
