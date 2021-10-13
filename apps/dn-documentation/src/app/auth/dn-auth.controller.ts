import {Body, Controller, Get, Post, Res} from '@nestjs/common';
import {DnAuthService} from './dn-auth.service';
import {Response} from 'express';
import {jwtConfig} from './jwt.config';
import {DnCoreConfigService} from '../core/modules/core-config/dn-core-config.service';
import {CmCredentials} from '@monorepo/common-model';
import {BlPublic} from '@monorepo/back-core-lib';

@Controller('auth')
export class DnAuthController {

  constructor(
    private authService: DnAuthService,
    private configService: DnCoreConfigService
  ) {
  }

  @BlPublic()
  @Post('login')
  async login(@Body() credentials: CmCredentials, @Res() response: Response): Promise<void> {
    const token: string = await this.authService.login(credentials);

    this.setTokenInResponseCookies(token, jwtConfig.tokenDurationInMilliseconds, response);
    response.send({expiresIn: jwtConfig.tokenDurationInMilliseconds});
  }

  @BlPublic()
  @Post('logout')
  async logout(@Body() body: any, @Res() response: Response): Promise<void> {
    this.setTokenInResponseCookies('', 0, response);
    response.send();
  }


  /**
   * Set the token in the Authorization cookie with httpOnly option
   * to prevent js from accessing it
   */
  private setTokenInResponseCookies(token: string, expiresInMilliseconds: number, response: Response): void {
    response.cookie(jwtConfig.authorizationCookie, token,
      {
        path: '/', maxAge: expiresInMilliseconds, sameSite: 'strict',
        httpOnly: true, secure: !this.configService.isLocal(),
      });
  }
}
