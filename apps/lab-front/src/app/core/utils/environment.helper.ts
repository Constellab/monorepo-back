/**
 * Static class to access environment
 *
 * The environment variable must always be access from here
 */
import {environment} from '../../../environments/environment';
import {Environment} from '../../../environments/environment.class';

export class EnvironmentHelper {

  public static readonly coreApiRoute: string = 'core-api';

  public static getCoreApiUrl(): string {
    return `${EnvironmentHelper.getBaseApiUrl()}${EnvironmentHelper.coreApiRoute}/`;
  }

  public static getCodeServerUrl(): string {
    return EnvironmentHelper.getEnv().settings.codeServerUrl;
  }

  public static getBaseApiUrl(): string {
    return EnvironmentHelper.getEnv().settings.apiBaseUrl;
  }

  public static getEnv(): Environment {
    return environment;
  }

  public static isProd(): boolean {
    return EnvironmentHelper.getEnv().production;
  }
}
