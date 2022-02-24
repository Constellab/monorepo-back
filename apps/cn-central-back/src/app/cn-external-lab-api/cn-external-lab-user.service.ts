import {BadRequestException, Injectable} from '@nestjs/common';
import {CnExternalLabApiService} from './cn-external-lab-api.service';
import {CnExternalLabLoginResponse, CnExternalLabUser, CnExternalLabUserGroup} from './model/cn-external-lab-api.class';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnExternalApiInfo} from '../cn-core/model/config/cn-config.class';
import {lastValueFrom} from 'rxjs';


/**
 * Service to call route for user in the lab instance
 */
@Injectable()
export class CnExternalLabUserService {

  private readonly route: string = 'user';

  constructor(private externalLabApiService: CnExternalLabApiService) {
  }

  /**
   * Log the user to the lab, it returns a one time token for the user
   * to open the lab. Then in the lab it will generate a JWT for the user
   */
  public generateTempAccess(labInfo: CnExternalApiInfo, user: CnUser): Promise<CnExternalLabLoginResponse> {
    const body: any = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      theme: user.theme,
      lang: user.lang
    };

    return lastValueFrom(this.externalLabApiService.post(labInfo, `${this.route}/generate-temp-access`, body));
  }

  /**
   * Retrieve the list of user in the lab
   */
  public async getUsers(labInfo: CnExternalApiInfo): Promise<CnExternalLabUser[]> {
    return lastValueFrom(this.externalLabApiService.get(labInfo, this.route));
  }

  /**
   * Retrieve the list of user in the lab
   */
  public getUser(labInfo: CnExternalApiInfo, userId: string): Promise<CnExternalLabUser> {
    return lastValueFrom(this.externalLabApiService.get(labInfo, `${this.route}/${userId}`));
  }

  /**
   * Add a user in the lab
   * Throw an exception if the user already exists in the lab
   */
  public async addUser(labInfo: CnExternalApiInfo, user: CnUser, group: CnExternalLabUserGroup): Promise<CnExternalLabUser> {

    const labUser: CnExternalLabUser = await this.getUser(labInfo, user.id);

    // if the user already exist in the lab
    if (labUser != null) {
      throw new BadRequestException(CnErrorText.USER_ALREADY_EXIST_IN_LAB);
    }

    const newLabUser: CnExternalLabUser = {
      id: user.id,
      email: user.email,
      group: group,
      first_name: user.firstname,
      last_name: user.lastname,
      is_active: true,
      is_admin: group === 'ADMIN'
    };

    return lastValueFrom(this.externalLabApiService.post(labInfo, this.route, newLabUser));
  }
}
