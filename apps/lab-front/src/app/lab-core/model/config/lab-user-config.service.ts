import {Injectable} from '@angular/core';

import {LabEnvironmentHelper} from '../../utils/lab-environment.helper';
import {FlUserConfig} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class LabUserConfig extends FlUserConfig {

  constructor() {
    super();
  }

  getUserPhotoUrl(userId: string): string {
    return LabEnvironmentHelper.getSpaceApiUrl() + 'users/photo/' + userId;
  }

  getUserDetailRoute(userId: string): string {
    // disabled user detail route
    return null;
  }

}
