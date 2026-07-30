import {
  BlCredentials,
  BlCredentials2Fa,
  BlJwtService,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { HnErrorText } from '../core/model/config/hn-error-text.class';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import { HnSpaceAuthService } from './hn-space-auth.service';
import { HnRefreshTokenService } from './refresh-token/hn-refresh-token.service';

/**
 * The pair handed out on every successful authentication.
 */
export interface HnAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface HnAuthResponse {
  status: 'LOGGED_IN' | '2FA_REQUIRED';
  tokens?: HnAuthTokens;
  twoFAUrlCode?: string;
}

@Injectable()
export class HnAuthService {
  constructor(
    private userService: HnUserService,
    private jwtService: BlJwtService,
    private spaceAuthService: HnSpaceAuthService,
    private coreConfigService: HnCoreConfigService,
    private refreshTokenService: HnRefreshTokenService
  ) {}

  async login(credentials: BlCredentials): Promise<HnAuthResponse> {
    const checkCredential = this.coreConfigService.isLocal()
      ? await this.userService.getUserCredentialsResponse(credentials)
      : await this.spaceAuthService.checkUserCredential(credentials);

    // if the user is not found, return an error
    if (checkCredential.status === 'ERROR') {
      throw new BlUnauthorizedException(HnErrorText.WRONG_CREDENTIALS);
    }

    // if there is no 2FA, the user can be logged in
    if (checkCredential.status === 'OK' && checkCredential.user) {
      let user: HnUser | null = await this.userService.findOne(checkCredential.user.id);
      await this.userService.createOrUpdate(checkCredential.user);
      if (!user) {
        user = await this.userService.findByIdAndCheck(checkCredential.user.id);
      }

      return {
        status: 'LOGGED_IN',
        tokens: await this.openSession(user),
      };
    } else {
      return {
        status: '2FA_REQUIRED',
        twoFAUrlCode: checkCredential.twoFAUrlCode,
      };
    }
  }

  async loginWith2FA(credentials: BlCredentials2Fa): Promise<HnAuthTokens> {
    const user: HnUser = await this.spaceAuthService.check2FA(credentials);
    let dbUser = await this.userService.findOne(user.id);

    if (!dbUser) {
      await this.userService.createOrUpdate(user);
      dbUser = await this.userService.findByIdAndCheck(user.id);
    }

    return await this.openSession(dbUser);
  }

  /**
   * Exchange a refresh token for a new pair.
   */
  async refreshSession(presentedRefreshToken: string | undefined): Promise<HnAuthTokens> {
    if (!presentedRefreshToken) {
      throw new BlUnauthorizedException(HnErrorText.WRONG_TOKEN);
    }

    const rotation = await this.refreshTokenService.rotate(presentedRefreshToken, 'session');
    if (rotation == null) {
      throw new BlUnauthorizedException(HnErrorText.WRONG_TOKEN);
    }

    return {
      accessToken: this.generateAccessToken(rotation.user),
      refreshToken: rotation.token,
    };
  }

  /**
   * End a session server-side. Tolerant of a missing or stale token: a logout must
   * not fail just because the browser no longer holds a usable one.
   */
  async closeSession(presentedRefreshToken: string | undefined): Promise<void> {
    if (presentedRefreshToken) {
      await this.refreshTokenService.revoke(presentedRefreshToken);
    }
  }

  /** Mint the access/refresh pair and persist the session row behind the refresh token. */
  private async openSession(user: HnUser): Promise<HnAuthTokens> {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: await this.refreshTokenService.issue(user, 'session'),
    };
  }

  private generateAccessToken(user: HnUser): string {
    return this.jwtService.generateToken(
      user.id,
      user.email,
      this.coreConfigService.getAccessTokenDurationInSeconds()
    );
  }
}
