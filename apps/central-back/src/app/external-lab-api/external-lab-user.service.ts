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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public login(labInfo: LabServerInfo, user: User): Promise<ExternalLabLoginResponse> {
    const body: any = {
      uri: '123456'
    };

    return this.externalLabApiService.post(labInfo, `${this.route}/generate-access-token`, body).toPromise();

    // const formData: FormData = new FormData();
    // formData.append('username', '123');
    // formData.append('password', 'string');
    // formData.append('scope', '');
    // formData.append('client_id', '');
    // formData.append('client_secret', '');
    //
    // return this.externalLabApiService.postFormData(labInfo, `handshake`, formData).toPromise();
  }
}
