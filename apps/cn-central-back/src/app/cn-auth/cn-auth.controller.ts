import {Body, Controller, Param, ParseBoolPipe, Post, Res} from '@nestjs/common';
import {CnAuthResponse, CnAuthService, CnExternalCheckCredentialResponse} from './cn-auth.service';
import {Response} from 'express';
import {cnJwtConfig} from './cn-jwt.config';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {BlPublic} from '@monorepo/back-core-lib';
import {CmCredentials, CmCredentials2Fa} from '@monorepo/common-model';
import {CnUser} from '../cn-users/cn-user.entity';

@Controller('auth')
export class CnAuthController {


  constructor(private authService: CnAuthService,
              private configService: CnCoreConfigService) {
  }

  /**
   * Login with credentials
   *
   * IF 2FA activated, return 2FA_REQUIRED
   * Else  It stores automatically in a secure cookie
   */
  @BlPublic()
  @Post('login')
  async login(@Body() credentials: CmCredentials, @Res() response: Response): Promise<void> {
    const result: CnAuthResponse = await this.authService.login(credentials);

    if (result.status === 'LOGGED_IN') {
      this.setTokenInCookie(result.token, response);
      response.send({status: 'LOGGED_IN', expiresIn: cnJwtConfig.tokenDurationInMilliseconds});
    } else {
      response.send({status: '2FA_REQUIRED', twoFAUrlCode: result.twoFAUrlCode});
    }
  }

  /**
   * Login with 2Fa code after the basic login
   * It stores automatically in a secure cookie
   */
  @BlPublic()
  @Post('login-2fa')
  async login2Fa(@Body() credentials: CmCredentials2Fa, @Res() response: Response): Promise<void> {
    const token = await this.authService.loginWith2FA(credentials);

    this.setTokenInCookie(token, response);
    response.send({status: 'LOGGED_IN', expiresIn: cnJwtConfig.tokenDurationInMilliseconds});
  }


  /**
   * Check if a user can login with the credential and check that the user have the right role
   */
  @BlPublic()
  @Post('external/check-credentials/:requiresAdmin')
  checkCredentialsWithRole(@Param('requiresAdmin', new ParseBoolPipe) requiresAdmin: boolean,
                           @Body() credentials: CmCredentials): Promise<CnExternalCheckCredentialResponse> {
    return this.authService.externalCheckCredentials(credentials, requiresAdmin);
  }

  /**
   * Called by external service to check the 2fa code and return user if ok
   */
  @BlPublic()
  @Post('external/check-2fa')
  externalCheck2Fa(@Body() credentials: CmCredentials2Fa): Promise<CnUser> {
    return this.authService.externalCheck2FA(credentials);
  }

  /**
   * Logout, it removes the Authorization cookie
   */
  @BlPublic()
  @Post('logout')
  async logout(@Body() credentials: CmCredentials, @Res() response: Response): Promise<void> {

    this.clearTokenCookie(response);
    response.send();
  }

  private setTokenInCookie(token: string, response: Response): void {
    this.configureTokenCookie(token, cnJwtConfig.tokenDurationInMilliseconds, response);
  }

  private clearTokenCookie(response: Response): void {
    this.configureTokenCookie('', 0, response);
  }

  /**
   * Set the token in the Authorization cookie with httpOnly option
   * to prevent js from accessing it
   */
  private configureTokenCookie(token: string, expiresInMilliseconds: number, response: Response): void {
    response.cookie(cnJwtConfig.authorizationCookie, token,
      {
        path: '/', maxAge: expiresInMilliseconds, sameSite: 'lax',
        httpOnly: true, secure: !this.configService.isLocal(),
      });
  }
}
