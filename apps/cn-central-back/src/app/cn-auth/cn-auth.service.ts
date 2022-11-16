import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnUserAccountsService} from '../cn-users/cn-users-account/cn-user-accounts.service';
import {ClDateHelper} from '@monorepo/core-lib';
import {CmCredentials, CmCredentials2Fa, CmUserCategory, CmUserStatus} from '@monorepo/common-model';
import {BlJwtService} from '@monorepo/back-core-lib';
import {CnUser2FAService} from './cn-user-2-f-a/cn-user-2-f-a.service';

export interface CnAuthResponse {
  status: 'LOGGED_IN' | '2FA_REQUIRED';
  token?: string;
  twoFAUrlCode?: string;
}

@Injectable()
export class CnAuthService {

  private readonly failedLoginLock: number;

  private readonly activationLinkValidity: number = 86400 * 7;


  constructor(private usersService: CnUsersService,
              private jwtService: BlJwtService,
              private configService: CnCoreConfigService,
              private userAccountsService: CnUserAccountsService,
              private user2FaService: CnUser2FAService) {
    this.failedLoginLock = configService.getFailedLoginLock();
  }

  async login(credentials: CmCredentials): Promise<CnAuthResponse> {
    const user = await this.checkCredentialsAndUser(credentials);

    if (user.has2FA) {
      const user2FA = await this.user2FaService.generateCode(user);
      return {
        status: '2FA_REQUIRED',
        twoFAUrlCode: user2FA.urlCode
      };
    } else {
      return {
        status: 'LOGGED_IN',
        token: this.jwtService.generateToken(user.id, user.email)
      };
    }
  }

  async loginWith2FA(credentials: CmCredentials2Fa): Promise<string> {
    const user = await this.user2FaService.checkIsValidCode(credentials.twoFACode, credentials.twoFAUrlCode);

    return this.jwtService.generateToken(user.id, user.email);
  }

  async checkCredentialsWithRole(category: CmUserCategory, credentials: CmCredentials): Promise<CnUser | null> {
    const user = await this.checkCredentialsAndUser(credentials);

    if (user.category === category) {
      return user;
    }

    return null;
  }

  private async checkCredentialsAndUser(credentials: CmCredentials): Promise<CnUser> {
    const user = await this.usersService.findByEmail(credentials.email);

    // if the email is wrong
    if (user == null) {
      throw new UnauthorizedException(CnErrorText.WRONG_CREDENTIALS);
    }

    if (user.status === CmUserStatus.WAITING_FOR_EMAIL) {
      throw new UnauthorizedException(CnErrorText.ACCOUNT_NOT_ACTIVATED);
    }

    if (user.status === CmUserStatus.WAITING_FOR_ADMIN) {
      throw new UnauthorizedException(CnErrorText.ACCOUNT_NOT_ADMIN_ACTIVATED);
    }

    // check if user is locked
    if (user.failedLoginCount >= this.failedLoginLock) {
      throw new UnauthorizedException(CnErrorText.USER_LOCKED);
    }

    if (!await user.comparePassword(credentials.password)) {
      // increment the failed login count
      await this.incrementFailedLoginCount(user);

      // check if user is locked
      if (user.failedLoginCount >= this.failedLoginLock) {
        this.userAccountsService.sendAccountLockedMail(user, this.activationLinkValidity, this.failedLoginLock);
        throw new UnauthorizedException(CnErrorText.USER_LOCKED);
      } else {
        throw new UnauthorizedException(CnErrorText.WRONG_CREDENTIALS);
      }
    }

    // login successful
    if (user.failedLoginCount > 0) {
      await this.resetFailedLoginCount(user);
    }

    return user;
  }


  /**
   * Update the failed login attempt count in the DB and set
   * the last attempt date
   * @param user
   * @private
   */
  private async incrementFailedLoginCount(user: CnUser): Promise<void> {
    user.failedLoginCount++;
    user.lastLoginAttempt = ClDateHelper.getDate();

    await this.usersService.update(user);
  }

  /**
   * reset the failedLoginCount to 0
   * @param user
   * @private
   */
  private async resetFailedLoginCount(user: CnUser): Promise<void> {
    user.failedLoginCount = 0;
    await this.usersService.update(user);
  }
}
