import {Body, Controller, Post, Res} from '@nestjs/common';
import {HnAuthResponse, HnAuthService} from './hn-auth.service';
import {Response} from 'express';
import {hnJwtConfig} from './hn-jwt.config';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {BlCredentials, BlCredentials2Fa, BlPublicSecure} from '@monorepo/back-core-lib';

@Controller('auth')
export class HnAuthController {

  constructor(private authService: HnAuthService,
              private configService: HnCoreConfigService) {
  }

  /**
   * Login with credentials
   *
   * IF 2FA activated, return 2FA_REQUIRED
   * Else  It stores automatically in a secure cookie
   */
  @BlPublicSecure()
  @Post('login')
  async login(@Body() credentials: BlCredentials, @Res() response: Response): Promise<void> {
    const result: HnAuthResponse = await this.authService.login(credentials);

    if (result.status === 'LOGGED_IN') {
      this.setTokenInCookie(result.token, response);
      response.send({status: 'LOGGED_IN', expiresIn: hnJwtConfig.tokenDurationInMilliseconds});
    } else {
      response.send({status: '2FA_REQUIRED', twoFAUrlCode: result.twoFAUrlCode});
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
    response.send({status: 'LOGGED_IN', expiresIn: hnJwtConfig.tokenDurationInMilliseconds});
  }

  @BlPublicSecure()
  @Post('logout')
  async logout(@Body() body: any, @Res() response: Response): Promise<void> {
    this.clearTokenCookie(response);
    response.send();
  }

  private setTokenInCookie(token: string, response: Response): void {
    this.configureTokenCookie(token, hnJwtConfig.tokenDurationInMilliseconds, response);
  }

  private clearTokenCookie(response: Response): void {
    this.configureTokenCookie('', 0, response);
  }


  /**
   * Set the token in the Authorization cookie with httpOnly option
   * to prevent js from accessing it
   */
  private configureTokenCookie(token: string, expiresInMilliseconds: number, response: Response): void {
    response.cookie(hnJwtConfig.authorizationCookie, token,
      this.configService.getSameSite() && this.configService.getDomain() ? {
        path: '/', maxAge: expiresInMilliseconds, sameSite: this.configService.getSameSite(), domain: this.configService.getDomain(),
        httpOnly: true, secure: !this.configService.isLocal(),
      } : {
        path: '/', maxAge: expiresInMilliseconds, sameSite: 'strict',
        httpOnly: true, secure: !this.configService.isLocal(),
      });
  }
}
