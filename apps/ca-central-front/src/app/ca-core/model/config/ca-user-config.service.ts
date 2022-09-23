import {Injectable} from '@angular/core';
import {
  FlUserConfig
} from '../../../../../../../libs/front-core-lib/src/lib/module/fl-user/service/fl-user-config.config';
import {CaUsersService} from '../../service-api/ca-users.service';

@Injectable({
  providedIn: 'root'
})
export class CaUserConfig extends FlUserConfig {

  constructor(private userService: CaUsersService) {
    super();
  }

  getUserPhoto(userId: string): string {
    return this.userService.getUserPhoto(userId);
  }


}
