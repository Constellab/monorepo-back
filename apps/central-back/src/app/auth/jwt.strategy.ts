import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-jwt';
import {jwtConfig} from './jwt.config';
import {CookieHelper} from '../core/utils/cookie.helper';
import {Request} from 'express';
import {TokenUser} from '../core/model/config/token-user.class';
import {User} from '../users/user.entity';
import {UsersService} from '../users/users.service';
import {CoreConfigService} from '../core/modules/core-config/core-config.service';

/**
 * Method to extract the token form the Authorization cookie from the request
 */
function extractAuthFromAuthorizationCookie(request: Request): string | undefined {
  return CookieHelper.getCookieFromHeader(request.headers.cookie, jwtConfig.authorizationCookie);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService, private coreConfigService: CoreConfigService) {
    super({
      jwtFromRequest: extractAuthFromAuthorizationCookie,
      ignoreExpiration: false,
      secretOrKey: coreConfigService.getJwtSecret(),
    });
  }

  /**
   * The return object will be set user attribute of req
   * So we will be able to retrieve the user with req.user
   */
  async validate(payload: TokenUser): Promise<User> {
    const currentUser: User = await this.usersService.findOne(payload.sub);

    if (currentUser == null) {
      throw new UnauthorizedException();
    }
    return currentUser;
  }
}
