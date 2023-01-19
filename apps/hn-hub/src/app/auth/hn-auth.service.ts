import {Injectable} from '@nestjs/common';
import {HnUserService} from '../users/hn-user.service';
import {CmCredentials, CmCredentials2Fa} from '@monorepo/common-model';
import {BlJwtService} from '@monorepo/back-core-lib';
import {HnUser} from '../users/hn-user.entity';
import {HnCentralAuthService} from './hn-central-auth.service';
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
    const checkCredential =
      this.coreConfigService.isLocal() ? await this.userService.getUserCredentialsResponse(credentials)
        : await this.centralAuthService.checkUserCredentialAndAdmin(credentials);

    // if there is no 2FA, the user can be logged in
    if (checkCredential.status === 'OK') {
      const user: HnUser = await this.createOrUpdateUser(checkCredential.user);

      const token = this.jwtService.generateToken(user.id, user.email);
      return {
        status: 'LOGGED_IN',
        token: token,
      }
    }else{
      return {
        status: '2FA_REQUIRED',
        twoFAUrlCode: checkCredential.twoFAUrlCode,
      }
    }
  }

  async loginWith2FA(credentials: CmCredentials2Fa): Promise<string> {
    const user: HnUser = await this.centralAuthService.check2FA(credentials);
    const dbUser = await this.createOrUpdateUser(user);

    return this.jwtService.generateToken(dbUser.id, dbUser.email);
  }


  async createOrUpdateUser(userFromCentral: HnUser): Promise<HnUser> {
    const user: HnUser = new HnUser();
    user.id = userFromCentral.id;
    user.firstname = userFromCentral.firstname;
    user.lastname = userFromCentral.lastname;
    user.lang = userFromCentral.lang;
    user.email = userFromCentral.email;

    return await this.userService.createOrUpdate(user);
  }
}

