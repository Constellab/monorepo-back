import {BadRequestException, Injectable} from '@nestjs/common';
import {ExternalLabApiService} from './external-lab-api.service';
import {LabServerInfo} from '../core/model/config/lab-server-info.class';
import {ExternalLabLoginResponse, ExternalLabUser, ExternalLabUserGroup} from './external-lab-api.class';
import {User} from '../users/user.entity';
import {ErrorText} from '../core/model/config/error-text.class';


/**
 * Service to call route for user in the lab instance
 */
@Injectable()
export class ExternalLabUserService {

  private readonly route: string = 'user';

  constructor(private externalLabApiService: ExternalLabApiService) {
  }

  /**
   * Log the user to the lab, it returns a one time token for the user
   * to open the lab. Then in the lab it will generate a JWT for the user
   */
  public login(labInfo: LabServerInfo, user: User): Promise<ExternalLabLoginResponse> {
    const body: any = {
      id: user.id
    };

    return this.externalLabApiService.post(labInfo, `${this.route}/generate-access-token`, body).toPromise();
  }

  /**
   * Retrieve the list of user in the lab
   */
  public async getUsers(labInfo: LabServerInfo): Promise<ExternalLabUser[]> {
    return await this.externalLabApiService.get(labInfo, this.route).toPromise();
  }

  /**
   * Retrieve the list of user in the lab
   */
  public getUser(labInfo: LabServerInfo, userId: string): Promise<ExternalLabUser> {
    return this.externalLabApiService.get(labInfo, `${this.route}/${userId}`).toPromise();
  }

  /**
   * Add a user in the lab
   * Throw an exception if the user already exists in the lab
   */
  public async addUser(labInfo: LabServerInfo, user: User, group: ExternalLabUserGroup): Promise<ExternalLabUser> {

    const labUser: ExternalLabUser = await this.getUser(labInfo, user.id);

    // if the user already exist in the lab
    if (labUser != null) {
      throw new BadRequestException(ErrorText.USER_ALREADY_EXIST_IN_LAB);
    }

    const newLabUser: ExternalLabUser = {
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
