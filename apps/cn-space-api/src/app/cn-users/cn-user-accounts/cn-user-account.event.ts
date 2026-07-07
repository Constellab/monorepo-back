import { CnUser } from '../cn-user.entity';

export const CN_USER_ACCOUNT_EVENT_NAME = 'cn-user-account-event';

export type CnUserAccountEvent =
  | {
      type: 'CREATE_USER' | 'ACTIVATE_USER';
      user: CnUser;
    }
  | {
      type: 'ACCOUNT_LOCKED';
      user: CnUser;
      failedLoginLock: number;
    };
