import {Body, Controller, Post, Res} from '@nestjs/common';
import {Credentials} from './credentials.class';
import {AuthService} from './auth.service';
import {Public} from '../core/decorators/public.decorator';
import {Response} from 'express';
import {jwtConfig} from './jwt.config';
import {CoreConfigService} from '../core/modules/core-config/core-config.service';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService,
              private configService: CoreConfigService) {
  }

  /**
   * Login with credentials
   * It stores automatically in a secure cookie
   */
  @Public()
  @Post('login')
  async login(@Body() credentials: Credentials, @Res() response: Response): Promise<void> {
    const token: string = await this.authService.login(credentials);

    this.setTokenInResponseCookies(token, jwtConfig.tokenDurationInMilliseconds, response);
    response.send({expiresIn: jwtConfig.tokenDurationInMilliseconds});
  }

  /**
   * Logout, it removes the Authorization cookie
   */
  @Public()
  @Post('logout')
  async logout(@Body() credentials: Credentials, @Res() response: Response): Promise<void> {

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
        path: '/',  maxAge: expiresInMilliseconds, sameSite: 'strict',
        httpOnly: true, secure: !this.configService.isLocal(),
      });
  }

}
