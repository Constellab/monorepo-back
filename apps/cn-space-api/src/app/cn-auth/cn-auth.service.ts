import {
  BlCredentials,
  BlCredentials2Fa,
  BlJwtService,
  BlUnauthorizedException,
  BlUserStatus,
} from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCaptchaService } from '../cn-core/services/cn-captcha.service';
import { CnUser } from '../cn-users/cn-user.entity';
import {
  CN_USER_ACCOUNT_EVENT_NAME,
  CnUserAccountEvent,
} from '../cn-users/cn-user-accounts/cn-user-account.event';
import { CnUsersService } from '../cn-users/cn-users.service';
import { CnRefreshTokenService } from './cn-refresh-token/cn-refresh-token.service';
import { CnUser2FAService } from './cn-user-2-f-a/cn-user-2-f-a.service';

/**
 * The pair handed out on every successful authentication.
 */
export interface CnAuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * A union rather than one shape with optional fields, so the controller cannot be handed
 * a `LOGGED_IN` without tokens and has no impossible branch to guard.
 */
export type CnAuthResponse =
  { status: 'LOGGED_IN'; tokens: CnAuthTokens } | { status: '2FA_REQUIRED'; twoFAUrlCode: string };

export interface CnExternalCheckCredentialResponse {
  status: 'OK' | '2FA_REQUIRED';
  user?: CnUser;
  twoFAUrlCode?: string;
}

@Injectable()
export class CnAuthService {
  constructor(
    private usersService: CnUsersService,
    private jwtService: BlJwtService,
    private configService: CnCoreConfigService,
    private user2FaService: CnUser2FAService,
    private captchaService: CnCaptchaService,
    private eventEmitter: EventEmitter2,
    private refreshTokenService: CnRefreshTokenService
  ) {}

  public async login(credentials: BlCredentials): Promise<CnAuthResponse> {
    const user = await this.checkCredentialsAndUser(credentials, true);

    if (user.has2FA) {
      const user2FA = await this.user2FaService.generateCode(user);
      return {
        status: '2FA_REQUIRED',
        twoFAUrlCode: user2FA.urlCode,
      };
    } else {
      return {
        status: 'LOGGED_IN',
        tokens: await this.openSession(user),
      };
    }
  }

  public async loginWith2FA(credentials: BlCredentials2Fa): Promise<CnAuthTokens> {
    const user = await this.user2FaService.checkIsValidCode(credentials.twoFACode, credentials.twoFAUrlCode);

    return await this.openSession(user);
  }

  /**
   * Exchange a refresh token for a new pair.
   *
   * Every failure — no token, unknown, expired, already consumed, owner no longer allowed
   * to log in — is the same 401. The caller learns nothing from which one it was, and a
   * consumed one additionally ends the session it belonged to; see
   * `BlRefreshTokenService.rotate`.
   */
  public async refreshSession(presentedRefreshToken: string | undefined): Promise<CnAuthTokens> {
    if (!presentedRefreshToken) {
      throw new BlUnauthorizedException(CnErrorText.WRONG_TOKEN);
    }

    const rotation = await this.refreshTokenService.rotate(presentedRefreshToken, 'session');
    if (rotation == null) {
      throw new BlUnauthorizedException(CnErrorText.WRONG_TOKEN);
    }

    // The row surviving is not enough: an account locked by an admin since the session
    // opened must lose it, and this is the only place that can enforce that. Nothing
    // downstream re-checks the status — `CnUsersService.findOne`, which the JWT strategy
    // resolves the user through, does not filter on it — so without this a locked account
    // would keep renewing indefinitely while being refused at the login page.
    //
    // The row goes with the refusal, on the token the rotation just wrote: leaving it
    // would let the holder retry every fifteen minutes forever.
    if (rotation.user.status !== BlUserStatus.READY) {
      await this.refreshTokenService.revoke(rotation.token);
      throw new BlUnauthorizedException(CnErrorText.WRONG_TOKEN);
    }

    return {
      accessToken: this.generateAccessToken(rotation.user),
      refreshToken: rotation.token,
    };
  }

  /**
   * End a session server-side. Tolerant of a missing or stale token: a logout must not
   * fail just because the browser no longer holds a usable one.
   */
  public async closeSession(presentedRefreshToken: string | undefined): Promise<void> {
    if (presentedRefreshToken) {
      await this.refreshTokenService.revoke(presentedRefreshToken);
    }
  }

  public async externalCheckCredentials(
    credentials: BlCredentials,
    checkCaptcha: boolean,
    ignore2Fa: boolean = false
  ): Promise<CnExternalCheckCredentialResponse> {
    const user = await this.checkCredentialsAndUser(credentials, checkCaptcha);

    if (user.has2FA && !ignore2Fa) {
      const user2FA = await this.user2FaService.generateCode(user);
      return {
        status: '2FA_REQUIRED',
        twoFAUrlCode: user2FA.urlCode,
      };
    } else {
      return {
        status: 'OK',
        user,
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
      const captchaCheck = await this.captchaService.validateCaptcha(credentials.captcha, 'login');

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

    if (!(await user.comparePassword(credentials.password))) {
      // increment the failed login count
      await this.incrementFailedLoginCount(user);

      // check if user is locked
      if (user.failedLoginCount >= failedLoginLock) {
        const lockEvent: CnUserAccountEvent = {
          type: 'ACCOUNT_LOCKED',
          user: user,
          failedLoginLock,
        };
        this.eventEmitter.emit(CN_USER_ACCOUNT_EVENT_NAME, lockEvent);
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

  /** Mint the access/refresh pair and persist the row the refresh token stands for. */
  private async openSession(user: CnUser): Promise<CnAuthTokens> {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: await this.refreshTokenService.issue(user, 'session'),
    };
  }

  /**
   * The lifetime is read here rather than at startup, so an environment that changes it
   * does not need the module re-created for the new value to apply.
   */
  private generateAccessToken(user: CnUser): string {
    return this.jwtService.generateToken(
      user.id,
      user.email,
      this.configService.getAccessTokenDurationInSeconds()
    );
  }
}
