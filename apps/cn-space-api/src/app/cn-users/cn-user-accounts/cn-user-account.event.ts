import { CnUser } from '../cn-user.entity';

export const cnUserAccountEventName = 'cn-user-account-event';

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
