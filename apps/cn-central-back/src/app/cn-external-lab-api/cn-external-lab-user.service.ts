import {Injectable} from '@nestjs/common';
import {CnExternalLabApiService} from './cn-external-lab-api.service';
import {CnExternalLabLoginResponse, CnExternalLabUser, CnExternalLabUserRole} from './model/cn-external-lab-api.class';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnExternalApiInfo} from '../cn-core/model/config/cn-config.class';
import {lastValueFrom} from 'rxjs';
import {CnSpace} from '../cn-spaces/cn-space.entity';

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
  public generateTempAccess(labInfo: CnExternalApiInfo, user: CnUser,
                            labSpace: CnSpace): Promise<CnExternalLabLoginResponse> {
    const body: any = {
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        theme: user.theme,
        lang: user.lang
      },
      space: {
        id: labSpace.id,
        name: labSpace.name,
        domain: labSpace.domain,
        photo: labSpace.photo
      }
    };

    return lastValueFrom(this.externalLabApiService.post(labInfo, `${this.route}/generate-temp-access`, body));
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
  public async addUser(labInfo: CnExternalApiInfo, user: CnUser, role: CnExternalLabUserRole): Promise<CnExternalLabUser> {

    const newLabUser: CnExternalLabUser = {
      id: user.id,
      email: user.email,
      group: role,
      first_name: user.firstname,
      last_name: user.lastname,
      is_active: true,
      theme: user.theme,
      lang: user.lang
    };

    return lastValueFrom(this.externalLabApiService.post(labInfo, this.route, newLabUser));
  }

  public async deactivateUser(labInfo: CnExternalApiInfo, userId: string): Promise<void> {
    return lastValueFrom(this.externalLabApiService.put(labInfo, `${this.route}/${userId}/deactivate`, null));
  }
}
