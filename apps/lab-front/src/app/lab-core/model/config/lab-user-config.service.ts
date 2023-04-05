import {Injectable} from '@angular/core';
import {LabEnvironmentHelper} from '../../utils/lab-environment.helper';
import {FlDatasourcePaginated, FlUserConfig} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabUser} from '../entities/lab-user.entity';

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

  getUserById(userId: string): Observable<LabUser> {
    throw new Error('Method not implemented.');
  }

  getSearchByNamesDatasource(): FlDatasourcePaginated<LabUser> {
    throw new Error('Method not implemented.');
  }

  getAuthenticatedUser(): LabUser {
    throw new Error('Method not implemented.');
  }

}
