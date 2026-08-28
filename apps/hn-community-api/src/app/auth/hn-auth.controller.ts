import {
  BlCookieHelper,
  BlCredentials,
  BlCredentials2Fa,
  BlPublicSecure,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';

import { HnErrorText } from '../core/model/config/hn-error-text.class';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnAuthResponse, HnAuthService, HnAuthTokens } from './hn-auth.service';
import { HN_JWT_CONFIG } from './hn-jwt.config';

/**
 * Rate limit for the endpoints that verify a credential, tighter than the app-wide
 * ceiling in `hn-app.module.ts`. Per IP, per minute (`ttl` is in milliseconds).
 */
const CREDENTIAL_THROTTLE = { limit: 10, ttl: 60_000 };

@Controller('auth')
export class HnAuthController {
  constructor(
    private authService: HnAuthService,
    private configService: HnCoreConfigService
  ) {}

  /**
   * Login with credentials
   *
   * IF 2FA activated, return 2FA_REQUIRED
   * Else  It stores automatically in a secure cookie
   */
  @BlPublicSecure(CREDENTIAL_THROTTLE)
  @Post('login')
  async login(@Body() credentials: BlCredentials, @Res() response: Response): Promise<void> {
    const result: HnAuthResponse = await this.authService.login(credentials);

    if (result.status === 'LOGGED_IN') {
      if (!result.tokens) {
        throw new BlUnauthorizedException(HnErrorText.WRONG_CREDENTIALS);
      }
      this.sendSession(result.tokens, response);
    } else {
      response.send({ status: '2FA_REQUIRED', twoFAUrlCode: result.twoFAUrlCode });
    }
  }

  /**
   * Login with 2Fa code after the basic login
   * It stores automatically in a secure cookie
   */
  @BlPublicSecure(CREDENTIAL_THROTTLE)
  @Post('login-2fa')
  async login2Fa(@Body() credentials: BlCredentials2Fa, @Res() response: Response): Promise<void> {
    const tokens = await this.authService.loginWith2FA(credentials);
    this.sendSession(tokens, response);
  }

  /**
   * Exchange the refresh cookie for a fresh token pair.
   *
   * Public because it is reached precisely when the access token is no longer valid,
   * and throttled because it is a credential entry point. The response is identical
   * to a login's, so the front has a single code path.
   */
  @BlPublicSecure()
  @Post('refresh')
  async refresh(@Req() request: Request, @Res() response: Response): Promise<void> {
    const tokens = await this.authService.refreshSession(this.readRefreshCookie(request));
    this.sendSession(tokens, response);
  }

  /**
   * Deletes the session row, so the refresh token dies immediately. The access
   * token in flight stays valid until it expires.
   */
  @BlPublicSecure()
  @Post('logout')
  async logout(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.authService.closeSession(this.readRefreshCookie(request));

    this.clearAccessCookie(response);
    this.clearRefreshCookie(response);
    this.clearSessionMarkerCookie(response);
    response.send();
  }

  /**
   * Set the three session cookies. Every successful authentication goes through here —
   * login, 2FA and refresh — which is what keeps the session marker's lifetime aligned
   * with the refresh token's on every rotation.
   */
  private sendSession(tokens: HnAuthTokens, response: Response): void {
    const accessDurationInMilliseconds = this.configService.getAccessTokenDurationInSeconds() * 1000;

    this.setAccessCookie(tokens.accessToken, response);
    this.setRefreshCookie(tokens.refreshToken, response);
    this.setSessionMarkerCookie(response);

    // `expiresIn` has always been in milliseconds and describes the access token.
    response.send({ status: 'LOGGED_IN', expiresIn: accessDurationInMilliseconds });
  }

  private readRefreshCookie(request: Request): string | undefined {
    return BlCookieHelper.getCookieFromHeader(request.headers.cookie ?? '', HN_JWT_CONFIG.refreshCookie);
  }

  /**
   * The cookie deliberately OUTLIVES the token it carries.
   *
   * Its lifetime is the refresh token's, not the access token's 15 minutes. A cookie's
   * `maxAge` is not a security control — `exp` inside the signature is, and
   * `BlJwtStrategy` enforces it with `ignoreExpiration: false`. Expiring the cookie
   * alongside the token protects nothing and destroys the only signal that matters: with
   * the cookie gone, the server can no longer tell "session gone stale" from "never
   * logged in", and an `@BlOptionalAuth` route silently serves the anonymous answer
   * instead of asking the caller to refresh.
   */
  private setAccessCookie(token: string, response: Response): void {
    const maxAge = this.configService.getRefreshTokenDurationInSeconds() * 1000;
    response.cookie(HN_JWT_CONFIG.authorizationCookie, token, this.cookieOptions('/', maxAge));
  }

  private clearAccessCookie(response: Response): void {
    response.cookie(HN_JWT_CONFIG.authorizationCookie, '', this.cookieOptions('/', 0));
  }

  private setRefreshCookie(token: string, response: Response): void {
    const maxAge: number = this.configService.getRefreshTokenDurationInSeconds() * 1000;
    response.cookie(
      HN_JWT_CONFIG.refreshCookie,
      token,
      this.cookieOptions(HN_JWT_CONFIG.refreshCookiePath, maxAge)
    );
  }

  private clearRefreshCookie(response: Response): void {
    // The path must match the one it was set with, or the browser keeps the cookie.
    response.cookie(HN_JWT_CONFIG.refreshCookie, '', this.cookieOptions(HN_JWT_CONFIG.refreshCookiePath, 0));
  }

  /**
   * Tells the server-side renderer a session exists — see `sessionMarkerCookie`.
   *
   * `Path=/` because the renderer must see it whatever page is requested, and the same
   * lifetime as the refresh token so its absence means the session is really gone.
   */
  private setSessionMarkerCookie(response: Response): void {
    const maxAge: number = this.configService.getRefreshTokenDurationInSeconds() * 1000;
    response.cookie(
      HN_JWT_CONFIG.sessionMarkerCookie,
      HN_JWT_CONFIG.sessionMarkerValue,
      this.cookieOptions('/', maxAge)
    );
  }

  private clearSessionMarkerCookie(response: Response): void {
    response.cookie(HN_JWT_CONFIG.sessionMarkerCookie, '', this.cookieOptions('/', 0));
  }

  /**
   * Attributes shared by all three session cookies. `httpOnly` keeps them away from JS
   * — including the marker, which only the server-side renderer reads. They differ only
   * in `path`: the refresh cookie is narrowed to `/auth` so this long-lived credential
   * is not sent on every API call.
   */
  private cookieOptions(path: string, maxAge: number): CookieOptions {
    const domain: string = this.configService.getDomain();
    const options: CookieOptions = {
      path,
      maxAge,
      sameSite: 'lax',
      httpOnly: true,
      secure: !this.configService.isLocal(),
    };
    return domain ? { ...options, domain } : options;
  }
}
