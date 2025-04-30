import { CnUser } from './cn-user.entity';

export const cnUserEventName = 'cn-user-event';

export type CnUserEventType = 'CREATE_USER';

export interface CnUserEvent {
  type: CnUserEventType;
  user: CnUser;
}
