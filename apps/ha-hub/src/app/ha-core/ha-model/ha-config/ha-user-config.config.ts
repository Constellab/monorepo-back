import {Injectable} from '@angular/core';
import {FlDatasourcePaginated, FlUserConfig} from '@monorepo/front-core-lib';
import {HaConstellabHelper} from './ha-constellab.helper';
import {HaUser} from '../ha-entities/ha-user';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HaUserConfig extends FlUserConfig {

  constructor() {
    super();
  }

  getUserPhotoUrl(userId: string): string {
    return HaConstellabHelper.getConstellabUserPhotoUrl(userId);
  }

  getUserDetailRoute(userId: string): string {
    return null;
  }

  getUserById(userId: string): Observable<HaUser> {
    throw new Error('Method not implemented.');
  }

  getSearchByNamesDatasource(): FlDatasourcePaginated<HaUser> {
    throw new Error('Method not implemented.');
  }

  getAuthenticatedUser(): HaUser {
    throw new Error('Method not implemented.');
  }
}
