import {BlUser} from '../../models/bl-user.class';
import {Request} from 'express';

export const BL_JWT_CONFIG_PROVIDER = Symbol();

export interface BlJwtConfig {
  jwtSecret: string;
  jwtFromRequest: (request: Request) => string | undefined;
  usersService: BlUserService;
}

export interface BlTokenUser {
  sub: string; // user id
  email: string; // user mail
}

export abstract class BlUserService {
  public abstract findOne(id: string): Promise<BlUser>;
}

