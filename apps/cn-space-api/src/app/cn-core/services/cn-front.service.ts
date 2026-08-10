import { Injectable } from '@nestjs/common';

import { CnSpaceService } from '../../cn-spaces/cn-space.service';
import { CnCoreConfigService } from '../modules/cn-core-config/cn-core-config.service';

/**
 * Core service to manager front URLs
 */
@Injectable()
export class CnFrontService {
  constructor(
    private configService: CnCoreConfigService,
    private spaceService: CnSpaceService
  ) {}

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

  public static getScenarioRoute(folderId: string): string {
    return `${CnFrontService.appRoute}/folder/scenario/${folderId}`;
  }

  public static getConstellabDocRoute(docId: string): string {
    return `${CnFrontService.appRoute}/folder/document/${docId}`;
  }

  public static getDocumentRoute(documentId: string): string {
    return `${CnFrontService.appRoute}/folder/document/${documentId}/preview`;
  }

  public static getResourceRoute(resourceId: string): string {
    return `${CnFrontService.appRoute}/folder/resource/${resourceId}`;
  }

  public static getLabRoute(labId: string): string {
    return `${CnFrontService.appRoute}/labs/${labId}`;
  }
  ///////////////////////////// URLS //////////////////////////////
  public getLoginUrl(): string {
    return this.getBaseWebsiteURL() + '/login';
  }

  public async getDocumentUrl(
    spaceId: string,
    documentId: string,
    isConstellabDocument: boolean
  ): Promise<string> {
    const route = isConstellabDocument
      ? CnFrontService.getConstellabDocRoute(documentId)
      : CnFrontService.getDocumentRoute(documentId);
    return (await this.getSpaceWebsiteURLFromId(spaceId)) + '/' + route;
  }

  public async getSignupSpaceUrl(spaceId: string, invitationCode: string): Promise<string> {
    return (await this.getSpaceWebsiteURLFromId(spaceId)) + '/signup-space/' + invitationCode;
  }

  public async getLabUrl(spaceId: string, labId: string): Promise<string> {
    return (await this.getSpaceWebsiteURLFromId(spaceId)) + '/' + CnFrontService.getLabRoute(labId);
  }

  public async getNoteUrl(spaceId: string, noteId: string): Promise<string> {
    return (await this.getSpaceWebsiteURLFromId(spaceId)) + '/' + CnFrontService.getNoteRoute(noteId);
  }

  ////////////////////////// PUBLIC ROUTES ////////////////////////////
  public getHierarchyObjectTokenUrl(spaceDomain: string, token: string): string {
    return this.getSpaceWebsiteURL(spaceDomain) + `/public/object/${token}`;
  }

  /**
   * Get the base url of the website (without the url of the space)
   */
  public getBaseWebsiteURL(): string {
    return this.configService.getFrontBaseUrl();
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

  public async getSpaceWebsiteURLFromId(spaceId: string): Promise<string> {
    const space = await this.spaceService.findByIdAndCheck(spaceId);
    return this.getSpaceWebsiteURL(space.domain);
  }

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
