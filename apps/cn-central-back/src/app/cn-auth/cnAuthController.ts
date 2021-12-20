import {Body, Controller, Param, Post, Res} from '@nestjs/common';
import {CnAuthService} from './cn-auth.service';
import {Response} from 'express';
import {cnJwtConfig} from './cn-jwt.config';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {BlParseEnumPipe, BlPublic} from '@monorepo/back-core-lib';
import {CmCredentials, CmUserCategory} from '@monorepo/common-model';
import {CnUser} from '../cn-users/cn-user.entity';

@Controller('auth')
export class CnAuthController {


  constructor(private authService: CnAuthService,
              private configService: CnCoreConfigService) {
  }

  /**
   * Login with credentials
   * It stores automatically in a secure cookie
   */
  @BlPublic()
  @Post('login')
  async login(@Body() credentials: CmCredentials, @Res() response: Response): Promise<void> {
    const token: string = await this.authService.login(credentials);

    this.setTokenInResponseCookies(token, cnJwtConfig.tokenDurationInMilliseconds, response);
    response.send({expiresIn: cnJwtConfig.tokenDurationInMilliseconds});
  }

  /**
   * Check if a user can login with the credential and check that the user have the right role
   */
  @BlPublic()
  @Post('check-credentials/:role')
  checkCredentialsWithRole(@Param('role', new BlParseEnumPipe(CmUserCategory)) category: CmUserCategory,
                           @Body() credentials: CmCredentials): Promise<CnUser | null> {
    return this.authService.checkCredentialsWithRole(category, credentials);
  }

  /**
   * Logout, it removes the Authorization cookie
   */
  @BlPublic()
  @Post('logout')
  async logout(@Body() credentials: CmCredentials, @Res() response: Response): Promise<void> {

    this.setTokenInResponseCookies('', 0, response);
    response.send();
  }

  /**
   * Set the token in the Authorization cookie with httpOnly option
   * to prevent js from accessing it
   */
  private setTokenInResponseCookies(token: string, expiresInMilliseconds: number, response: Response): void {
    response.cookie(cnJwtConfig.authorizationCookie, token,
      {
        path: '/', maxAge: expiresInMilliseconds, sameSite: 'strict',
        httpOnly: true, secure: !this.configService.isLocal(),
      });
  }

}
