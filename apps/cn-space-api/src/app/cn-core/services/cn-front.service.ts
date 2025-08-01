import { Injectable } from '@nestjs/common';

import { CnCoreConfigService } from '../modules/cn-core-config/cn-core-config.service';

/**
 * Core service to manager front URLs
 */
@Injectable()
export class CnFrontService {
  constructor(private configService: CnCoreConfigService) {}

  private static appRoute = 'app';

  public static getAdminUsersRoute(): string {
    return `${CnFrontService.appRoute}/admin/users`;
  }

  public static getFoldersRoute(): string {
    return `${CnFrontService.appRoute}/folder`;
  }

  public static getFolderRoute(folderId: string): string {
    return `${CnFrontService.appRoute}/folder/${folderId}`;
  }

  public static getChatMessageRoute(folderId: string): string {
    return `${CnFrontService.appRoute}/chat/folder/${folderId}`;
  }

  public static getNoteRoute(folderId: string): string {
    return `${CnFrontService.appRoute}/folder/note/${folderId}`;
  }

  public getNoteUrl(spaceDomain: string, noteId: string): string {
    return this.getSpaceWebsiteURL(spaceDomain) + '/' + CnFrontService.getNoteRoute(noteId);
  }

  public static getScenarioRoute(folderId: string): string {
    return `${CnFrontService.appRoute}/folder/scenario/${folderId}`;
  }

  public static getConstellabDocRoute(docId: string): string {
    return `${CnFrontService.appRoute}/folder/document/${docId}`;
  }

  public static getDocumentRoute(documentId: string): string {
    return `${CnFrontService.appRoute}/folder/document/${documentId}/preview`;
  }

  public getDocumentUrl(spaceDomain: string, documentId: string, isConstellabDocument: boolean): string {
    const route = isConstellabDocument
      ? CnFrontService.getConstellabDocRoute(documentId)
      : CnFrontService.getDocumentRoute(documentId);
    return this.getSpaceWebsiteURL(spaceDomain) + '/' + route;
  }

  public static getResourceRoute(resourceId: string): string {
    return `${CnFrontService.appRoute}/folder/resource/${resourceId}`;
  }

  public static getLabRoute(labId: string): string {
    return `${CnFrontService.appRoute}/labs/${labId}`;
  }

  public getLoginUrl(): string {
    return this.getBaseWebsiteURL() + '/login';
  }

  public getSignupSpaceUrl(spaceDomain: string, invitationCode: string): string {
    return this.getSpaceWebsiteURL(spaceDomain) + '/signup-space/' + invitationCode;
  }

  public getLabUrl(spaceDomain: string, labId: string): string {
    return this.getSpaceWebsiteURL(spaceDomain) + '/' + CnFrontService.getLabRoute(labId);
  }

  ////////////////////////// PUBLIC ROUTES ////////////////////////////
  public getHierarchyObjectTokenUrl(spaceDomain: string, token: string): string {
    return this.getSpaceWebsiteURL(spaceDomain) + `/public/object/${token}`;
  }

  /**
   * Get the base url of the website (without the url of the space)
   */
  public getBaseWebsiteURL(): string {
    if (this.configService.isLocal()) {
      return 'http://' + this.configService.getFrontDomain();
    } else {
      return 'https://' + this.configService.getFrontDomain();
    }
  }

  /**
   * Get the base url of the website (without the url of the space)
   */
  public getSpaceWebsiteURL(spaceDomain: string): string {
    if (this.configService.isLocal()) {
      return `http://${this.configService.getFrontDomain()}`;
    } else {
      return `https://${spaceDomain}.${this.configService.getFrontDomain()}`;
    }
  }

  //////////////////////////// COMMUNITY ////////////////////////////
  //////////////////////////// COMMUNITY ////////////////////////////
  public getCommunityUrl(): string {
    return this.configService.getCommunityFrontUrl();
  }

  public getCommunityProductDocUrl(): string {
    return (
      this.getCommunityUrl() + '/gws_academy/latest/doc/getting-started/b38e4929-2e4f-469c-b47b-f9921a3d4c74'
    );
  }
}
