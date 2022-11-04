import {environment} from '../../../environments/ca-environment';

/**
 * Class to get url of the hub
 */
export class CaHubUrlHelper {


  public static getHubUrl(): string {
    return environment.hubUrl;
  }

  public static getGwsCoreUrl(): string {
    return this.getHubUrl() + "bricks/gws_core/latest";
  }

  public static getDevEnvironmentUrl(): string {
    return this.getGwsCoreUrl() + "/doc/developer-guide/dev-environment"
  }
}
