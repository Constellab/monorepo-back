import {CaEnvironment} from '../../../environments/ca-environment.class';
import {environment} from '../../../environments/ca-environment';

export class CaEnvironmentHelper{

  public static getEnv(): CaEnvironment {
    return environment;
  }

  public static isProduction(): boolean {
    return CaEnvironmentHelper.getEnv().production;
  }

  public static getApiUrl(): string {
    return CaEnvironmentHelper.getEnv().settings.apiUrl;
  }

  public static getCommunityFrontUrl(): string {
    return CaEnvironmentHelper.getEnv().settings.communityFrontUrl;
  }

  public static getCommunityApiUrl(): string {
    return CaEnvironmentHelper.getEnv().settings.communityApiUrl;
  }

  public static getFrontDomain(): string {
    return CaEnvironmentHelper.getEnv().settings.frontDomain;
  }
}
