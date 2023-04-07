import {Injectable} from '@nestjs/common';
import {HnUserService} from '../users/hn-user.service';
import {CmCredentials, CmCredentials2Fa} from '@monorepo/common-model';
import {BlJwtService} from '@monorepo/back-core-lib';
import {HnUser, HnUserConstellabDTO} from '../users/hn-user.entity';
import {HnCentralAuthService, HnExternalCheckCredentialResponse} from './hn-central-auth.service';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';

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
    private centralAuthService: HnCentralAuthService,
    private coreConfigService: HnCoreConfigService) {
  }

  async login(credentials: CmCredentials): Promise<HnAuthResponse> {
    let checkCredential: HnExternalCheckCredentialResponse = null;

    // in local don't call central auth
    if (this.coreConfigService.isLocal()) {
      const user = await this.userService.findOneByEmail(credentials.email);

      if (!user) {
        throw new Error('User not found');
      }
      checkCredential = {
        status: 'OK',
        user: user
      };
    } else {
      checkCredential = await this.centralAuthService.checkUserCredential(credentials);
    }

    // if there is no 2FA, the user can be logged in
    if (checkCredential.status === 'OK' && checkCredential.user) {

      let user: HnUser = await this.userService.findOne(checkCredential.user.id);

      if (!user) {
        await this.userService.createOrUpdate(checkCredential.user);
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

  async loginWith2FA(credentials: CmCredentials2Fa): Promise<string> {
    const user: HnUser = await this.centralAuthService.check2FA(credentials);
    let dbUser = await this.userService.findOne(user.id);

    if (!dbUser) {
      await this.userService.createOrUpdate(user);
      dbUser = await this.userService.findOne(user.id);
    }

    return this.jwtService.generateToken(dbUser.id, dbUser.email);
  }


  async createOrUpdateUser(userFromCentral: HnUser): Promise<void> {
    const user: HnUserConstellabDTO = new HnUserConstellabDTO();
    user.id = userFromCentral.id;
    user.firstname = userFromCentral.firstname;
    user.lastname = userFromCentral.lastname;
    user.lang = userFromCentral.lang;
    user.email = userFromCentral.email;

    return await this.userService.createOrUpdate(user);
  }
}

