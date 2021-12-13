import {Body, Controller, Param, Post, Res} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Response} from 'express';
import {jwtConfig} from './jwt.config';
import {CoreConfigService} from '../core/modules/core-config/core-config.service';
import {BlParseEnumPipe, BlPublic} from '@monorepo/back-core-lib';
import {CmCredentials, CmUserCategory} from '@monorepo/common-model';
import {User} from '../users/user.entity';

@Controller('auth')
export class AuthController {


  constructor(private authService: AuthService,
              private configService: CoreConfigService) {
  }

  /**
   * Login with credentials
   * It stores automatically in a secure cookie
   */
  @BlPublic()
  @Post('login')
  async login(@Body() credentials: CmCredentials, @Res() response: Response): Promise<void> {
    const token: string = await this.authService.login(credentials);

    this.setTokenInResponseCookies(token, jwtConfig.tokenDurationInMilliseconds, response);
    response.send({expiresIn: jwtConfig.tokenDurationInMilliseconds});
  }

  /**
   * Check if a user can login with the credential and check that the user have the right role
   */
  @BlPublic()
  @Post('check-credentials/:role')
  checkCredentialsWithRole(@Param('role', new BlParseEnumPipe(CmUserCategory)) category: CmUserCategory,
                           @Body() credentials: CmCredentials): Promise<User | null> {
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
    response.cookie(jwtConfig.authorizationCookie, token,
      {
        path: '/', maxAge: expiresInMilliseconds, sameSite: 'strict',
        httpOnly: true, secure: !this.configService.isLocal(),
      });
  }

}
