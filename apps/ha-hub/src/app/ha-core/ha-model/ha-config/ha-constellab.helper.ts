import {HaEnvironmentHelper} from './ha-environment.helper';


export class HaConstellabHelper {

  /////////////////////////////// FRONT ///////////////////////////////

  public static getConstellabUrl(): string {
    return HaEnvironmentHelper.getConstellabFrontUrl();
  }

  public static getConstellabSignupUrl(): string {
    return HaConstellabHelper.getConstellabUrl() + '/signup';
  }

  /////////////////////////////// API ///////////////////////////////

  public static getConstellabApiUrl(): string {
    return HaEnvironmentHelper.getConstellabApiUrl();
  }

  public static getConstellabUserPhotoUrl(userId: string): string {
    return HaConstellabHelper.getConstellabApiUrl() + '/users/photo/' + userId;
  }
}
