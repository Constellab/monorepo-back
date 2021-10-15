import {Injectable, UnauthorizedException} from '@nestjs/common';
import {DnUserService} from '../users/dn-user.service';
import {CmCredentials} from '@monorepo/common-model';
import {BlExternalApiService, BlJwtService} from '@monorepo/back-core-lib';
import {DnCoreConfigService} from '../core/modules/core-config/dn-core-config.service';
import {DnUser} from '../users/dn-user.entity';

@Injectable()
export class DnAuthService {

  constructor(
    private userService: DnUserService,
    private jwtService: BlJwtService,
    private blExternalApiService: BlExternalApiService,
    private coreConfigService: DnCoreConfigService
  ) {}

  async login(credentials: CmCredentials): Promise<string> {
    const userCentral = await this.checkCredentialsAndUser(credentials);
    const user: DnUser = await this.createOrUpdateUser(userCentral);

    return this.jwtService.generateToken(user.id, user.email);
  }

  async checkCredentialsAndUser(credentials: CmCredentials): Promise<any>{
    try{
      const userCentral = await this.blExternalApiService
        .post(this.coreConfigService.getCentralApiUrl() + 'auth/check-credentials/ADMIN', credentials).toPromise();
      if(!userCentral){
        throw new UnauthorizedException('Wrong mail or passord');
      }
      return userCentral;
    }
    catch (e) {
      throw new UnauthorizedException('Wrong mail or password');
    }
  }

  async createOrUpdateUser(userFromCentral: any): Promise<DnUser>{
    const user: DnUser = new DnUser();
    user.id = userFromCentral.id;
    user.firstname = userFromCentral.firstname;
    user.lastname = userFromCentral.lastname;
    user.lang = userFromCentral.lang;
    user.email = userFromCentral.email;

    return await this.userService.createOrUpdate(user);
  }
}
