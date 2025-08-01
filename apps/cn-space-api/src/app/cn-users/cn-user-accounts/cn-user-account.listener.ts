import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CnAuthEvent, cnAuthEventName } from '../../cn-auth/cn-auth-event.class';
import { CnUserAccountsService } from './cn-user-accounts.service';

@Injectable()
export class CnUserAccountListener {
  constructor(private userAccountService: CnUserAccountsService) {}

  @OnEvent(cnAuthEventName)
  async handleAuthEvent(event: CnAuthEvent): Promise<void> {
    if (event.type === 'ACCOUNT_LOCKED') {
      this.handleAccountLockedEvent(event);
    }
  }

  private handleAccountLockedEvent(event: CnAuthEvent): void {
    this.userAccountService.sendAccountLockedMail(event.user, event.failedLoginLock);
  }
}
