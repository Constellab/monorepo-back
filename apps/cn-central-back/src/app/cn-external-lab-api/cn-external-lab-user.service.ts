import {BadRequestException, Injectable} from '@nestjs/common';
import {CnExternalLabApiService} from './cn-external-lab-api.service';
import {CnLabServerInfo} from '../cn-core/model/config/cn-lab-server-info.class';
import {CnExternalLabLoginResponse, CnExternalLabUser, CnExternalLabUserGroup} from './cn-external-lab-api.class';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';


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
  public login(labInfo: CnLabServerInfo, user: CnUser): Promise<CnExternalLabLoginResponse> {
    const body: any = {
      id: user.id
    };

    return this.externalLabApiService.post(labInfo, `${this.route}/generate-access-token`, body).toPromise();
  }

  /**
   * Retrieve the list of user in the lab
   */
  public async getUsers(labInfo: CnLabServerInfo): Promise<CnExternalLabUser[]> {
    return await this.externalLabApiService.get(labInfo, this.route).toPromise();
  }

  /**
   * Retrieve the list of user in the lab
   */
  public getUser(labInfo: CnLabServerInfo, userId: string): Promise<CnExternalLabUser> {
    return this.externalLabApiService.get(labInfo, `${this.route}/${userId}`).toPromise();
  }

  /**
   * Add a user in the lab
   * Throw an exception if the user already exists in the lab
   */
  public async addUser(labInfo: CnLabServerInfo, user: CnUser, group: CnExternalLabUserGroup): Promise<CnExternalLabUser> {

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

    return this.externalLabApiService.post(labInfo, this.route, newLabUser).toPromise();
  }
}
