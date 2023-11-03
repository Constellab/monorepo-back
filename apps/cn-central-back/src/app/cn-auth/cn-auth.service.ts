import {Injectable} from '@nestjs/common';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {ClDateHelper} from '@monorepo/core-lib';
import {
  BlCaptchaService,
  BlCredentials,
  BlCredentials2Fa,
  BlJwtService,
  BlUnauthorizedException,
  BlUserStatus
} from '@monorepo/back-core-lib';
import {CnUser2FAService} from './cn-user-2-f-a/cn-user-2-f-a.service';
import {EventEmitter2} from '@nestjs/event-emitter';
import {CnAuthEvent, cnAuthEventName} from './cn-auth-event.class';

export interface CnAuthResponse {
  status: 'LOGGED_IN' | '2FA_REQUIRED';
  token?: string;
  twoFAUrlCode?: string;
}

export interface CnExternalCheckCredentialResponse {
  status: 'OK' | '2FA_REQUIRED';
  user?: CnUser;
  twoFAUrlCode?: string;
}

@Injectable()
export class CnAuthService {

  constructor(private usersService: CnUsersService,
              private jwtService: BlJwtService,
              private configService: CnCoreConfigService,
              private user2FaService: CnUser2FAService,
              private captchaService: BlCaptchaService,
              private eventEmitter: EventEmitter2) {
  }

  public async login(credentials: BlCredentials): Promise<CnAuthResponse> {
    const user = await this.checkCredentialsAndUser(credentials, true);

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

  public async loginWith2FA(credentials: BlCredentials2Fa): Promise<string> {
    const user = await this.user2FaService.checkIsValidCode(credentials.twoFACode, credentials.twoFAUrlCode);

    return this.jwtService.generateToken(user.id, user.email);
  }

  public async externalCheckCredentials(credentials: BlCredentials, checkCaptcha: boolean,
                                        ignore2Fa: boolean = false): Promise<CnExternalCheckCredentialResponse> {
    const user = await this.checkCredentialsAndUser(credentials, checkCaptcha);

    if (user.has2FA && !ignore2Fa) {
      const user2FA = await this.user2FaService.generateCode(user);
      return {
        status: '2FA_REQUIRED',
        twoFAUrlCode: user2FA.urlCode
      };
    } else {
      return {
        status: 'OK',
        user
      };
    }
  }

  /**
   * 2FA login call by external services
   * @param credentials
   */
  public async externalCheck2FA(credentials: BlCredentials2Fa): Promise<CnUser> {
    return await this.user2FaService.checkIsValidCode(credentials.twoFACode, credentials.twoFAUrlCode);
  }

  public async checkCredentialsAndUser(credentials: BlCredentials, checkCaptcha: boolean): Promise<CnUser> {
    if (checkCaptcha) {
      const captchaCheck = await this.captchaService.validateCaptcha(credentials.captcha);

      if (!captchaCheck) {
        throw new BlUnauthorizedException(CnErrorText.INVALID_CAPTCHA);
      }
    }

    const user = await this.usersService.findByEmail(credentials.email);

    // if the email is wrong
    if (user == null) {
      throw new BlUnauthorizedException(CnErrorText.WRONG_CREDENTIALS);
    }

    if (user.status === BlUserStatus.WAITING_FOR_EMAIL) {
      throw new BlUnauthorizedException(CnErrorText.ACCOUNT_NOT_ACTIVATED);
    }

    if (user.status === BlUserStatus.LOCKED_BY_ADMIN) {
      throw new BlUnauthorizedException(CnErrorText.ACCOUNT_LOCKED_BY_ADMIN);
    }

    const failedLoginLock = this.configService.getFailedLoginLock();
    // check if user is locked
    if (user.failedLoginCount >= failedLoginLock) {
      throw new BlUnauthorizedException(CnErrorText.USER_LOCKED);
    }

    if (!await user.comparePassword(credentials.password)) {
      // increment the failed login count
      await this.incrementFailedLoginCount(user);

      // check if user is locked
      if (user.failedLoginCount >= failedLoginLock) {
        const lockEvent: CnAuthEvent = {
          type: 'ACCOUNT_LOCKED',
          user: user,
          failedLoginLock
        };
        this.eventEmitter.emit(cnAuthEventName, lockEvent);
        throw new BlUnauthorizedException(CnErrorText.USER_LOCKED);
      } else {
        throw new BlUnauthorizedException(CnErrorText.WRONG_CREDENTIALS);
      }
    }

    // login successful
    await this.loginSuccess(user);

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
  private async loginSuccess(user: CnUser): Promise<void> {
    user.failedLoginCount = 0;
    user.lastLoginSuccess = ClDateHelper.getDate();

    await this.usersService.update(user);
  }
}
