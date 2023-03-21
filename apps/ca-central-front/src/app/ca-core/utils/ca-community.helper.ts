import {environment} from '../../../environments/ca-environment';

/**
 * Class to get url of the hub
 */
export class CaCommunityHelper {


  public static getCommunityUrl(): string {
    return environment.hubUrl;
  }

  public static getTechDocUrl(): string {
    return this.getCommunityUrl() + "tech-doc";
  }

  public static getProductDocUrl(): string {
    return this.getTechDocUrl() + "product-doc";
  }

  public static getDevEnvironmentUrl(): string {
    return this.getTechDocUrl() + "/doc/developer-guide/dev-environment"
  }

  public static getOnPremiseDocUrl(): string {
    return this.getProductDocUrl() + "/doc/digital-lab/on-premises-digital-lab"
  }

}
