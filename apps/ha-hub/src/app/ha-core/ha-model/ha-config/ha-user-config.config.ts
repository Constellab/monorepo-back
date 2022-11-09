import {Injectable} from '@angular/core';
import {
  FlUserConfig
} from '../../../../../../../libs/front-core-lib/src/lib/module/fl-user/service/fl-user-config.config';
import {environment} from '../../../../environments/ha-environment';

@Injectable({
  providedIn: 'root'
})
export class HaUserConfig extends FlUserConfig {

  constructor() {
    super();
  }

  getUserPhotoUrl(userId: string): string {
    return environment.constellabApiUrl + 'users/photo/' + userId;
  }


}
