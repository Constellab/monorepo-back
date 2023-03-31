import {HaEnvironment} from '../../../../environments/ha-environment.class';
import {environment} from '../../../../environments/ha-environment';


export class HaEnvironmentHelper{

  public static getEnv(): HaEnvironment {
    return environment;
  }

  public static isProduction(): boolean {
    return HaEnvironmentHelper.getEnv().production;
  }

  public static getApiUrl(): string {
    return HaEnvironmentHelper.getEnv().settings.apiUrl;
  }

  public static getConstellabFrontUrl(): string {
    return HaEnvironmentHelper.getEnv().settings.constellabFrontUrl;
  }

  public static getConstellabApiUrl(): string {
    return HaEnvironmentHelper.getEnv().settings.constellabApiUrl;
  }

  public static getCommunityFrontUrl(): string {
    return HaEnvironmentHelper.getEnv().settings.communityFrontUrl;
  }
}
