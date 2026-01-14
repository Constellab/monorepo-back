import { BlMailService } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CnMailTemplate } from '../../cn-core/model/config/cn-mail-template.class';
import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnFrontService } from '../../cn-core/services/cn-front.service';
import { CnNotificationType } from '../../cn-notification/cn-notification.entity';
import { CnNotificationService } from '../../cn-notification/cn-notification.service';
import { CnUser } from '../cn-user.entity';
import { CnUsersService } from '../cn-users.service';
import { CnUserAccountEvent, cnUserAccountEventName } from './cn-user-account.event';
import { CnUserAccountsService } from './cn-user-accounts.service';

@Injectable()
export class CnUserAccountListener {
  private readonly logger = new Logger(CnUserAccountListener.name);

  constructor(
    private userAccountService: CnUserAccountsService,
    private mailService: BlMailService,
    private frontService: CnFrontService,
    private configService: CnCoreConfigService,
    private notificationService: CnNotificationService,
    private usersService: CnUsersService
  ) {}

  @OnEvent(cnUserAccountEventName)
  handleAuthEvent(event: CnUserAccountEvent): void {
    if (event.type === 'ACCOUNT_LOCKED') {
      this.handleAccountLockedEvent(event.user, event.failedLoginLock);
    } else if (event.type === 'ACTIVATE_USER') {
      this.handleAccountActivated(event.user);
    }
  }

  private handleAccountLockedEvent(user: CnUser, failedLoginLock: number): void {
    this.userAccountService.sendAccountLockedMail(user, failedLoginLock);
  }

  private handleAccountActivated(user: CnUser): void {
    // send mail asynchronously
    this.sendAccountValidatedMail(user).catch((error) =>
      this.logger.error('Error while sending account validated mail: ' + error)
    );

    // send notification to admin when user activates their account
    this.sendCreateAccountNotification(user).catch((error) =>
      this.logger.error('Error while sending create account notification: ' + error)
    );
  }

  /**
   * Send a welcome mail to the user with doc and info links
   * @param user
   * @private
   */
  private async sendAccountValidatedMail(user: CnUser): Promise<void> {
    await this.mailService.sendMailToUser(CnMailTemplate.signup_validated, user, {
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
      },
      documentationLink: this.frontService.getCommunityProductDocUrl(),
      communityLink: this.configService.getCommunityFrontUrl(),
      contactMail: this.configService.getCustomerSuccessMail(),
    });
  }

  /**
   * Send notification to admin when a new user activates their account
   * @param user
   * @private
   */
  private async sendCreateAccountNotification(user: CnUser): Promise<void> {
    const adminUserMails = this.configService.newUserNotifReceiver();

    for (const adminUserMail of adminUserMails) {
      const adminUser = await this.usersService.findByEmail(adminUserMail);

      if (adminUser == null) continue;
      await this.notificationService.createNotification({
        createdBy: user,
        objectType: CnNotificationType.USER,
        objectId: user.id,
        user: adminUser,
        text: `New user : ${user.firstname} ${user.lastname}`,
        text2: user.email,
        link: CnFrontService.getAdminUsersRoute(),
      });
    }
  }
}
