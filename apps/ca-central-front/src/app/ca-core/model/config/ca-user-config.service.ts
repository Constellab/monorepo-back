import {Injectable} from '@angular/core';
import {FlUserConfig} from '@monorepo/front-core-lib';
import {CaUsersService} from '../../service-api/ca-users.service';
import {CaRouterService} from '../../service/ca-router.service';

@Injectable({
  providedIn: 'root'
})
export class CaUserConfig extends FlUserConfig {

  constructor(private userService: CaUsersService) {
    super();
  }

  getUserPhotoUrl(userId: string): string {
    return this.userService.getUserPhoto(userId);
  }

  getUserDetailRoute(userId: string): string {
    return CaRouterService.getUserDetailRoute(userId);
  }



}
