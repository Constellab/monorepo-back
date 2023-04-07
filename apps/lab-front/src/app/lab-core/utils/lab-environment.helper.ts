import {environment} from '../../../environments/lab-environment';
import {LabEnvironment} from '../../../environments/lab-environment.class';

/**
 * Static class to access environment
 *
 * The environment variable must always be access from here
 */
export class LabEnvironmentHelper {

  public static readonly coreApiRoute: string = 'core-api';

  public static getCoreApiUrl(): string {
    return `${LabEnvironmentHelper.getBaseApiUrl()}/${LabEnvironmentHelper.coreApiRoute}/`;
  }

  public static getCodelabUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.codelabUrl;
  }

  // return the full URL for the codelab with direct link to open the right folder
  public static getCodelabFullUrl(): string {
    // eslint-disable-next-line max-len
    return `${LabEnvironmentHelper.getCodelabUrl()}/?folder=/lab/user`;
  }

  public static getBaseApiUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.apiBaseUrl;
  }

  public static getDevBaseApiUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.devApiBaseUrl;
  }

  public static getDevCoreApiUrl(): string {
    return `${LabEnvironmentHelper.getDevBaseApiUrl()}/${LabEnvironmentHelper.coreApiRoute}/`;
  }

  public static getSpaceFrontUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.spaceFrontUrl;
  }

  public static getSpaceApiUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.spaceApiUrl;
  }

  public static getCommunityFrontUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.communityFrontUrl;
  }

  public static getCommunityApiUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.communityApiUrl;
  }

  public static getSpaceFrontAppUrl(): string {
    return LabEnvironmentHelper.getSpaceFrontUrl() + '/app';
  }

  public static getSpaceConfigLabUrl(labId: string): string {
    return `${LabEnvironmentHelper.getSpaceFrontAppUrl()}/labs/${labId}/config`;
  }

  public static getEnv(): LabEnvironment {
    return environment;
  }
}
