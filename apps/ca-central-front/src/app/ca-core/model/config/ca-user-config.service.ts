import {Injectable} from '@angular/core';
import {FlUserConfig, FlUserConfigSearchNameMode} from '@monorepo/front-core-lib';
import {CaUsersService} from '../../service-api/ca-users.service';
import {CaRouterService} from '../../service/ca-router.service';
import {CaUser, CaUserDatasourcePaginated} from '../entities/ca-user.class';
import {Observable} from 'rxjs';
import {CaAuthenticatedUserService} from '../../service-api/ca-authenticated-user.service';
import {CaSpaceService} from '../../service-api/ca-space.service';

@Injectable({
  providedIn: 'root'
})
export class CaUserConfig extends FlUserConfig {

  constructor(private userService: CaUsersService,
              private authenticatedUserService: CaAuthenticatedUserService,
              private spaceService: CaSpaceService) {
    super();
  }

  getUserPhotoUrl(userId: string): string {
    return this.userService.getUserPhoto(userId);
  }

  getUserDetailRoute(userId: string): string {
    return CaRouterService.getUserDetailRoute(userId);
  }

  getUserById(userId: string): Observable<CaUser> {
    return this.userService.findById(userId);
  }

  getSearchByNamesDatasource(mode: FlUserConfigSearchNameMode): CaUserDatasourcePaginated {
    if (mode === 'all' || (mode === 'allForAdmin' && this.authenticatedUserService.isAdmin())) {
      return this.userService.searchByNamesDatasource();
    } else {
      return this.spaceService.searchSpaceUsersByNameDatasource('current');
    }
  }

  getAuthenticatedUser(): CaUser {
    return this.authenticatedUserService.getUser();
  }

}
