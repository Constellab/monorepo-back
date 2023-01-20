import {environment} from '../../../environments/lab-environment';
import {Environment} from '../../../environments/lab-environment.class';
import {LabEnvironment} from '../model/global/lab-environment.class';

/**
 * Static class to access environment
 *
 * The environment variable must always be access from here
 */
export class LabEnvironmentHelper {

  public static readonly coreApiRoute: string = 'core-api';

  public static getCoreApiUrl(): string {
    return `${LabEnvironmentHelper.getBaseApiUrl()}${LabEnvironmentHelper.coreApiRoute}/`;
  }

  public static getCodelabUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.codeServerUrl;
  }

  // return the full URL for the codelab with direct link to open the right folder
  public static getCodelabFullUrl(): string {
    // eslint-disable-next-line max-len
    return `${LabEnvironmentHelper.getCodelabUrl()}?folder=vscode-remote://codelab.${LabEnvironmentHelper.getEnv().settings.virtualHost}/lab/user`;
  }

  public static getBaseApiUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.apiBaseUrl;
  }

  public static getDevBaseApiUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.devApiBaseUrl;
  }

  public static getDevCoreApiUrl(): string {
    return `${LabEnvironmentHelper.getDevBaseApiUrl()}${LabEnvironmentHelper.coreApiRoute}/`;
  }

  public static getCentralFrontUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.centralFrontUrl;
  }

  public static getCentralApiUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.centralApiUrl;
  }

  public static getHubFrontUrl(): string {
    return LabEnvironmentHelper.getEnv().settings.hubFrontUrl;
  }

  public static getCentralFrontAppUrl(): string {
    return LabEnvironmentHelper.getCentralFrontUrl() + '/app';
  }

  public static getCentralConfigLabUrl(labId: string): string {
    return `${LabEnvironmentHelper.getCentralFrontAppUrl()}/labs/${labId}/config`;
  }

  public static getEnv(): Environment {
    return environment;
  }

  public static isProd(): boolean {
    return LabEnvironmentHelper.getEnv().production;
  }

  /**
   * Return the lab environment of an URL
   * @param url
   */
  public static getLabEnvFromUrl(url: string): LabEnvironment | null {
    if (url.startsWith(LabEnvironmentHelper.getBaseApiUrl())) {
      return 'prod';
    } else if (url.startsWith(LabEnvironmentHelper.getDevBaseApiUrl())) {
      return 'dev';
    }
    return null;
  }
}
