import { BlCredentials, BlCredentials2Fa, BlPublicSecure } from '@monorepo/back-core-lib';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnAuthResponse, CnAuthService, CnExternalCheckCredentialResponse } from './cn-auth.service';
import { CN_JWT_CONFIG } from './cn-jwt.config';

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
  @BlPublicSecure()
  @Post('login')
  async login(@Body() credentials: BlCredentials, @Res() response: Response): Promise<void> {
    const result: CnAuthResponse = await this.authService.login(credentials);

    if (result.status === 'LOGGED_IN' && result.token != null) {
      this.setTokenInCookie(result.token, response);
      response.send({ status: 'LOGGED_IN', expiresIn: CN_JWT_CONFIG.tokenDurationInMilliseconds });
    } else {
      response.send({ status: '2FA_REQUIRED', twoFAUrlCode: result.twoFAUrlCode });
    }
  }

  /**
   * Login with 2Fa code after the basic login
   * It stores automatically in a secure cookie
   */
  @BlPublicSecure()
  @Post('login-2fa')
  async login2Fa(@Body() credentials: BlCredentials2Fa, @Res() response: Response): Promise<void> {
    const token = await this.authService.loginWith2FA(credentials);

    this.setTokenInCookie(token, response);
    response.send({ status: 'LOGGED_IN', expiresIn: CN_JWT_CONFIG.tokenDurationInMilliseconds });
  }

  @BlPublicSecure()
  @Post('external/check-credentials')
  checkCredentials(@Body() credentials: BlCredentials): Promise<CnExternalCheckCredentialResponse> {
    return this.authService.externalCheckCredentials(credentials, true);
  }

  /**
   * Called by external service to check the 2fa code and return user if ok
   */
  @BlPublicSecure()
  @Post('external/check-2fa')
  externalCheck2Fa(@Body() credentials: BlCredentials2Fa): Promise<CnUser> {
    return this.authService.externalCheck2FA(credentials);
  }

  /**
   * Logout, it removes the Authorization cookie
   */
  @BlPublicSecure()
  @Post('logout')
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(@Body() credentials: BlCredentials, @Res() response: Response): Promise<void> {
    this.clearTokenCookie(response);
    response.send();
  }

  private setTokenInCookie(token: string, response: Response): void {
    this.configureTokenCookie(token, CN_JWT_CONFIG.tokenDurationInMilliseconds, response);
  }

  private clearTokenCookie(response: Response): void {
    this.configureTokenCookie('', 0, response);
  }

  /**
   * Set the token in the Authorization cookie with httpOnly option
   * to prevent js from accessing it
   */
  private configureTokenCookie(token: string, expiresInMilliseconds: number, response: Response): void {
    response.cookie(CN_JWT_CONFIG.authorizationCookie, token, {
      path: '/',
      maxAge: expiresInMilliseconds,
      // use none in production because the api is not un the same domain as the front
      sameSite: 'strict',
      httpOnly: true,
      secure: !this.configService.isLocal(),
    });
  }
}
