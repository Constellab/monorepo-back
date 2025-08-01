import {
  BlCredentials,
  BlCredentials2Fa,
  BlJwtService,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { HnErrorText } from '../core/model/config/hn-error-text.class';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import { HnSpaceAuthService } from './hn-space-auth.service';

export interface HnAuthResponse {
  status: 'LOGGED_IN' | '2FA_REQUIRED';
  token?: string;
  twoFAUrlCode?: string;
}

@Injectable()
export class HnAuthService {
  constructor(
    private userService: HnUserService,
    private jwtService: BlJwtService,
    private spaceAuthService: HnSpaceAuthService,
    private coreConfigService: HnCoreConfigService
  ) {}

  async login(credentials: BlCredentials): Promise<HnAuthResponse> {
    const checkCredential = this.coreConfigService.isLocal()
      ? await this.userService.getUserCredentialsResponse(credentials)
      : await this.spaceAuthService.checkUserCredential(credentials);

    // if the user is not found, return an error
    if (checkCredential.status === 'ERROR') {
      throw new BlUnauthorizedException(HnErrorText.WRONG_CREDENTIALS);
    }

    // if there is no 2FA, the user can be logged in
    if (checkCredential.status === 'OK' && checkCredential.user) {
      let user: HnUser = await this.userService.findOne(checkCredential.user.id);
      await this.userService.createOrUpdate(checkCredential.user);
      if (!user) {
        user = await this.userService.findOne(checkCredential.user.id);
      }

      const token = this.jwtService.generateToken(user.id, user.email);
      return {
        status: 'LOGGED_IN',
        token: token,
      };
    } else {
      return {
        status: '2FA_REQUIRED',
        twoFAUrlCode: checkCredential.twoFAUrlCode,
      };
    }
  }

  async loginWith2FA(credentials: BlCredentials2Fa): Promise<string> {
    const user: HnUser = await this.spaceAuthService.check2FA(credentials);
    let dbUser = await this.userService.findOne(user.id);

    if (!dbUser) {
      await this.userService.createOrUpdate(user);
      dbUser = await this.userService.findOne(user.id);
    }

    return this.jwtService.generateToken(dbUser.id, dbUser.email);
  }
}
