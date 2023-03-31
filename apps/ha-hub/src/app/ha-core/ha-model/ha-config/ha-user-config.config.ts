import {Injectable} from '@angular/core';
import {FlUserConfig} from '@monorepo/front-core-lib';
import {HaConstellabHelper} from './ha-constellab.helper';

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


}
