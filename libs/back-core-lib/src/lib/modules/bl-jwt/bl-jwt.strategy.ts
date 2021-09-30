import {Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-jwt';
import {BL_JWT_CONFIG_PROVIDER, BlJwtConfig, BlTokenUser} from './bl-jwt.class';
import {BlUser} from '../../models/bl-user.class';

@Injectable()
export class BlJwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(BL_JWT_CONFIG_PROVIDER) private jwtConfig: BlJwtConfig) {
    super({
      jwtFromRequest: jwtConfig.jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: jwtConfig.jwtSecret,
    });
  }

  /**
   * The return object will be set user attribute of req
   * So we will be able to retrieve the user with req.user
   */
  async validate(payload: BlTokenUser): Promise<BlUser> {
    const currentUser: BlUser = await this.jwtConfig.usersService.findOne(payload.sub);
    if (currentUser == null) {
      throw new UnauthorizedException();
    }
    return currentUser;
  }
}
