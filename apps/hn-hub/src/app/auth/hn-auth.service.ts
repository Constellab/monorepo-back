import {Injectable, UnauthorizedException} from '@nestjs/common';
import {HnUserService} from '../users/hn-user.service';
import {CmCredentials} from '@monorepo/common-model';
import {BlExternalApiService, BlJwtService} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {HnUser} from '../users/hn-user.entity';
import {lastValueFrom} from 'rxjs';

@Injectable()
export class HnAuthService {

  constructor(
    private userService: HnUserService,
    private jwtService: BlJwtService,
    private blExternalApiService: BlExternalApiService,
    private coreConfigService: HnCoreConfigService
  ) {
  }

  async login(credentials: CmCredentials): Promise<string> {
    const userCentral = await this.checkCredentialsAndUser(credentials);
    const user: HnUser = await this.createOrUpdateUser(userCentral);

    return this.jwtService.generateToken(user.id, user.email);
  }

  async checkCredentialsAndUser(credentials: CmCredentials): Promise<any> {
    try {
      const userCentral = await lastValueFrom(this.blExternalApiService
        .post(this.coreConfigService.getCentralApiUrl() + 'auth/check-credentials/ADMIN', credentials));
      if (!userCentral) {
        throw new UnauthorizedException('Wrong mail or passord');
      }
      console.log(userCentral)
      return userCentral;
    } catch (e: any) {
      if (e.status >= 500 && e.status < 600) {
        throw new UnauthorizedException('Central disconnected');
      }
      throw e;
    }
  }

  async createOrUpdateUser(userFromCentral: any): Promise<HnUser> {
    const user: HnUser = new HnUser();
    user.id = userFromCentral.id;
    user.firstname = userFromCentral.firstname;
    user.lastname = userFromCentral.lastname;
    user.lang = userFromCentral.lang;
    user.email = userFromCentral.email;

    return await this.userService.createOrUpdate(user);
  }
}

