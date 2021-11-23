import {environment} from '../../../environments/environment';
import {Environment} from '../../../environments/environment.class';
import {LabEnvironment} from '../model/global/lab-environment.class';

/**
 * Static class to access environment
 *
 * The environment variable must always be access from here
 */
export class EnvironmentHelper {

  public static readonly coreApiRoute: string = 'core-api';

  public static getCoreApiUrl(): string {
    return `${EnvironmentHelper.getBaseApiUrl()}${EnvironmentHelper.coreApiRoute}/`;
  }

  public static getCodelabUrl(): string {
    return EnvironmentHelper.getEnv().settings.codeServerUrl;
  }

  // return the full URL for the codelab with direct link to open the right folder
  public static getCodelabFullUrl(): string {
    // eslint-disable-next-line max-len
    return `${EnvironmentHelper.getCodelabUrl()}?folder=vscode-remote://codelab.${EnvironmentHelper.getEnv().settings.virtualHost}/lab/user`;
  }

  public static getBaseApiUrl(): string {
    return EnvironmentHelper.getEnv().settings.apiBaseUrl;
  }

  public static getDevBaseApiUrl(): string {
    return EnvironmentHelper.getEnv().settings.devApiBaseUrl;
  }

  public static getDevCoreApiUrl(): string {
    return `${EnvironmentHelper.getDevBaseApiUrl()}${EnvironmentHelper.coreApiRoute}/`;
  }

  public static getEnv(): Environment {
    return environment;
  }

  public static isProd(): boolean {
    return EnvironmentHelper.getEnv().production;
  }

  /**
   * Return the lab environment of an URL
   * @param url
   */
  public static getLabEnvFromUrl(url: string): LabEnvironment | null {
    if (url.startsWith(EnvironmentHelper.getBaseApiUrl())) {
      return 'prod';
    } else if (url.startsWith(EnvironmentHelper.getDevBaseApiUrl())) {
      return 'dev';
    }
    return null;
  }
}
