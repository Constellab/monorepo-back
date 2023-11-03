import {CnUser} from '../cn-users/cn-user.entity';

export const cnAuthEventName = 'cn-auth-event';

export type CnAuthEventType = 'ACCOUNT_LOCKED';

export interface CnAuthEvent {
  type: CnAuthEventType;
  user: CnUser;
  failedLoginLock: number; // only for ACCOUNT_LOCKED
}
