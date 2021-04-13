import {Injectable} from '@nestjs/common';
import {ExternalLabApiService} from './external-lab-api.service';
import {LabServerInfo} from '../core/model/config/lab-server-info.class';
import {ExternalLabLoginResponse} from './external-lab-api.class';
import {User} from '../users/user.entity';


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
    // todo replace with user
    const body: any = {
      uri: 'be6fd0a0-4494-4ad2-9a62-9a403e64d733'
    };

    return this.externalLabApiService.post(labInfo, `${this.route}/generate-access-token`, body).toPromise();
  }
}
