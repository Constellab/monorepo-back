import { BlCookieHelper, BlCredentials, BlCredentials2Fa, BlPublicSecure } from '@monorepo/back-core-lib';
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';

import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnUser } from '../cn-users/cn-user.entity';
import {
  CnAuthResponse,
  CnAuthService,
  CnAuthTokens,
  CnExternalCheckCredentialResponse,
} from './cn-auth.service';
import { CN_JWT_CONFIG } from './cn-jwt.config';

/**
 * Rate limit for the endpoints an end user hits to verify a credential, tighter than
 * the app-wide ceiling in `cn-app.module.ts`. Per IP, per minute (`ttl` is in ms).
 */
const CREDENTIAL_THROTTLE = { limit: 10, ttl: 60_000 };

/**
 * The `external/*` routes are called server-to-server by hn-community-api, not by a
 * browser, so every request arrives from ONE source IP — hn's server.
 *
 * The throttler keys on the IP and never reads the body, so it cannot tell which account
 * is being checked: this budget is **shared by all community users at once**, not per
 * account.
 */
const SERVER_TO_SERVER_THROTTLE = { limit: 1000, ttl: 60_000 };

@Controller('auth')
export class CnAuthController {
  constructor(
    private authService: CnAuthService,
    private configService: CnCoreConfigService
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
    const result: CnAuthResponse = await this.authService.login(credentials);

    if (result.status === 'LOGGED_IN') {
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
   * Public because it is reached precisely when the access token is no longer valid. Left
   * on the app-wide ceiling rather than `CREDENTIAL_THROTTLE`: the throttler keys on the
   * IP, this route is hit on every access token expiry, and the 256-bit token it carries
   * is not a guessable credential — the tight limit would cut off legitimate sessions
   * sharing one address long before it deterred anything.
   *
   * The response is identical to a login's, so the front has a single code path.
   */
  @BlPublicSecure()
  @Post('refresh')
  async refresh(@Req() request: Request, @Res() response: Response): Promise<void> {
    const tokens = await this.authService.refreshSession(this.readRefreshCookie(request));

    this.sendSession(tokens, response);
  }

  @BlPublicSecure(SERVER_TO_SERVER_THROTTLE)
  @Post('external/check-credentials')
  checkCredentials(@Body() credentials: BlCredentials): Promise<CnExternalCheckCredentialResponse> {
    return this.authService.externalCheckCredentials(credentials, true);
  }

  /**
   * Called by external service to check the 2fa code and return user if ok
   */
  @BlPublicSecure(SERVER_TO_SERVER_THROTTLE)
  @Post('external/check-2fa')
  externalCheck2Fa(@Body() credentials: BlCredentials2Fa): Promise<CnUser> {
    return this.authService.externalCheck2FA(credentials);
  }

  /**
   * Deletes the session row, so the refresh token dies immediately. The access token in
   * flight stays valid until it expires, which is why its lifetime is short.
   */
  @BlPublicSecure()
  @Post('logout')
  async logout(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.authService.closeSession(this.readRefreshCookie(request));

    this.clearAccessCookie(response);
    this.clearRefreshCookie(response);
    response.send();
  }

  /**
   * Set both session cookies. Every successful authentication goes through here — login,
   * 2FA and refresh — so a rotation renews the pair exactly as a login establishes it.
   */
  private sendSession(tokens: CnAuthTokens, response: Response): void {
    const accessDurationInMilliseconds = this.configService.getAccessTokenDurationInSeconds() * 1000;

    this.setAccessCookie(tokens.accessToken, response);
    this.setRefreshCookie(tokens.refreshToken, response);

    // `expiresIn` has always been in milliseconds and describes the access token: the
    // front arms its proactive renewal from it.
    response.send({ status: 'LOGGED_IN', expiresIn: accessDurationInMilliseconds });
  }

  private readRefreshCookie(request: Request): string | undefined {
    return BlCookieHelper.getCookieFromHeader(request.headers.cookie ?? '', CN_JWT_CONFIG.refreshCookie);
  }

  /**
   * The cookie deliberately OUTLIVES the token it carries: its lifetime is the refresh
   * token's, not the access token's minutes.
   *
   * A cookie's `maxAge` is not a security control — `exp` inside the signature is, and
   * `BlJwtStrategy` enforces it with `ignoreExpiration: false`. What the alignment buys is
   * that both session cookies appear and disappear together, so the browser never sits in
   * the state "refresh cookie but no access cookie", where the API cannot tell a session
   * gone stale from a caller that never logged in.
   */
  private setAccessCookie(token: string, response: Response): void {
    const maxAge: number = this.configService.getRefreshTokenDurationInSeconds() * 1000;
    response.cookie(CN_JWT_CONFIG.authorizationCookie, token, this.accessCookieOptions(maxAge));
  }

  private clearAccessCookie(response: Response): void {
    response.cookie(CN_JWT_CONFIG.authorizationCookie, '', this.accessCookieOptions(0));
  }

  /**
   * The access cookie, which is the one that has to survive a cross-site top-level
   * navigation.
   *
   * `/oauth/authorize` is reached by a machine client sending the browser here, so the
   * request arrives cross-site — and `sameSite: 'strict'` withholds the cookie on exactly
   * that hop. With it, a user who is already logged in resolves as anonymous and is
   * bounced to the login page on every authorization request, which is the whole logged-in
   * path of the Authorization Server.
   *
   * `'lax'` is still withheld on cross-site POSTs and on subresource loads, which is where
   * the CSRF exposure of a session credential actually lives. The refresh cookie stays
   * `'strict'`: it is only ever presented on this application's own POSTs, and nothing on
   * the authorization path reads it.
   */
  private accessCookieOptions(maxAge: number): CookieOptions {
    return { ...this.cookieOptions('/', maxAge), sameSite: 'lax' };
  }

  private setRefreshCookie(token: string, response: Response): void {
    const maxAge: number = this.configService.getRefreshTokenDurationInSeconds() * 1000;
    response.cookie(
      CN_JWT_CONFIG.refreshCookie,
      token,
      this.cookieOptions(CN_JWT_CONFIG.refreshCookiePath, maxAge)
    );
  }

  private clearRefreshCookie(response: Response): void {
    // The path must match the one it was set with, or the browser keeps the cookie.
    response.cookie(CN_JWT_CONFIG.refreshCookie, '', this.cookieOptions(CN_JWT_CONFIG.refreshCookiePath, 0));
  }

  /**
   * Attributes shared by both session cookies. `httpOnly` keeps them away from JS. They
   * differ in `path` — the refresh cookie is narrowed to `/auth` so this long-lived
   * credential is not sent on every API call — and in `sameSite`, see
   * {@link accessCookieOptions}.
   */
  private cookieOptions(path: string, maxAge: number): CookieOptions {
    return {
      path,
      maxAge,
      sameSite: 'strict',
      httpOnly: true,
      secure: !this.configService.isLocal(),
    };
  }
}
