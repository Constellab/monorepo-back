import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { BlUnauthorizedException } from '../../exceptions/bl-unauthorized.exception';
import { BlUser } from '../../models/bl-user/bl-user.class';
import { BL_JWT_CONFIG_PROVIDER, BlJwtConfig, BlTokenUser } from './bl-jwt.class';

@Injectable()
export class BlJwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(BL_JWT_CONFIG_PROVIDER) private jwtConfig: BlJwtConfig) {
    super({
      // passport-jwt expects the extractor to return string | null, but the
      // BlJwtConfig extractor returns string | undefined, so normalize undefined to null
      jwtFromRequest: (request) => jwtConfig.jwtFromRequest(request) ?? null,
      ignoreExpiration: false,
      secretOrKey: jwtConfig.jwtSecret,
    });
  }

  /**
   * The return object will be set user attribute of req
   * So we will be able to retrieve the user with req.user
   */
  async validate(payload: BlTokenUser): Promise<BlUser> {
    const currentUser: BlUser | null = await this.jwtConfig.usersService.findOne(payload.sub);
    if (currentUser == null) {
      throw new BlUnauthorizedException();
    }
    return currentUser;
  }
}
