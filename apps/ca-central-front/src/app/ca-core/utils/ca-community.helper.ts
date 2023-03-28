import {CaEnvironmentHelper} from './ca-environment.helper';
import {TdTypingName} from '@monorepo/technical-doc';

/**
 * Class to get url of the hub
 */
export class CaCommunityHelper {

  ///////////////////////// FRONT //////////////////////////

  public static getCommunityUrl(): string {
    return CaEnvironmentHelper.getCommunityFrontUrl();
  }

  public static getTechDocUrl(): string {
    return this.getCommunityUrl() + '/tech-doc';
  }

  public static getProductDocUrl(): string {
    return this.getCommunityUrl() + '/product-doc';
  }

  public static getDevEnvironmentUrl(): string {
    return this.getTechDocUrl() + '/doc/developer-guide/dev-environment';
  }

  public static getOnPremiseDocUrl(): string {
    return this.getProductDocUrl() + '/doc/digital-lab/on-premises-digital-lab';
  }

  public static getBrickUrl(brickName: string, version: string): string {
    const majorString: string = version.split('.')[0];
    return this.getCommunityUrl() + '/bricks/' + brickName + '/v' + majorString;
  }

  public static getTechnicalDocUrl(brickName: string, version: string, typingName: TdTypingName): string {
    return this.getBrickUrl(brickName, version) + '/doc/technical-folder/' + typingName.type.toLowerCase() + '/' + typingName.uniqueName;
  }

  public static getTaskUrl(brickName: string, taskUniqueName: string): string {
    return `${this.getCommunityUrl()}/bricks/${brickName}/latest/doc/technical-folder/task/${taskUniqueName}`;
  }

  ///////////////////////// API //////////////////////////

  public static getCommunityApiUrl(): string {
    return CaEnvironmentHelper.getCommunityApiUrl();
  }

  public static getTaskOfTheDayApiUrl(): string {
    return this.getCommunityApiUrl() + '/task/task-of-the-day';
  }

  public static getTechnicalDocByPathApiUrl(): string {
    return this.getCommunityApiUrl() + '/brick/technical-doc-by-path';
  }
}
