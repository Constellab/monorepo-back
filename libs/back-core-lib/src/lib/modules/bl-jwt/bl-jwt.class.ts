import { Request } from 'express';

import { BlUser } from '../../models/bl-user/bl-user.class';

export const BL_JWT_CONFIG_PROVIDER = Symbol();

export interface BlJwtConfig {
  jwtSecret: string;
  jwtFromRequest: (request: Request) => string | undefined;
  usersService: BlUserService;
  tokenDurationInSeconds: number;
}

export interface BlTokenUser {
  sub: string; // user id
  email: string; // user mail
}

export abstract class BlUserService {
  public abstract findOne(id: string): Promise<BlUser | null>;
}
