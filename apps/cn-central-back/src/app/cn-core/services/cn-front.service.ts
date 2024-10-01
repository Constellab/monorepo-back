import { Injectable } from '@nestjs/common';
import { CnCoreConfigService } from '../modules/cn-core-config/cn-core-config.service';

/**
 * Core service to manager front URLs
 */
@Injectable()
export class CnFrontService {

  constructor(private configService: CnCoreConfigService) {
  }

  private static appRoute = 'app';

  public static getAdminUsersRoute(): string {
    return `${CnFrontService.appRoute}/admin/users`;
  }

  public static getFolderRoute(folderId: string): string {
    return `${CnFrontService.appRoute}/folder/${folderId}`;
  }

  // TODO UPDATE TO NEW CHAT ROUTE
  public static getChatMessageRoute(folderId: string): string {
    return `${CnFrontService.getFolderRoute(folderId)}?type=comments`;
  }

  public static getNoteRoute(folderId: string): string {
    return `${CnFrontService.appRoute}/folder/note/${folderId}`;
  }

  public static getExperimentRoute(folderId: string): string {
    return `${CnFrontService.appRoute}/folder/experiment/${folderId}`;
  }

  public static getConstellabDocRoute(docId: string): string {
    return `${CnFrontService.appRoute}/folder/document/${docId}`;
  }

  public static getLabUrl(labId: string): string {
    return `${CnFrontService.appRoute}/labs/${labId}`;
  }


  public getLoginUrl(): string {
    return this.getBaseWebsiteURL() + '/login';
  }

  public getSignupSpaceUrl(spaceDomain: string, invitationCode: string): string {
    return this.getSpaceWebsiteURL(spaceDomain) + '/signup-space/' + invitationCode;
  }

  public getLabUrl(spaceDomain: string, labId: string): string {
    return this.getSpaceWebsiteURL(spaceDomain) + '/' + CnFrontService.getLabUrl(labId);
  }

  /**
   * Get the base url of the website (without the url of the space)
   */
  public getBaseWebsiteURL(): string {
    if (this.configService.isLocal()) {
      return 'http://' + this.configService.getCentralFrontDomain();
    } else {
      return 'https://' + this.configService.getCentralFrontDomain();
    }
  }

  /**
   * Get the base url of the website (without the url of the space)
   */
  public getSpaceWebsiteURL(spaceDomain: string): string {
    if (this.configService.isLocal()) {
      return `http://${this.configService.getCentralFrontDomain()}`;
    } else {
      return `https://${spaceDomain}.${this.configService.getCentralFrontDomain()}`;
    }
  }


  //////////////////////////// COMMUNITY ////////////////////////////
  public getCommunityUrl(): string {
    return this.configService.getCommunityFrontUrl();
  }

  public getCommunityProductDocUrl(): string {
    return this.getCommunityUrl() + '/product-doc';
  }
}
