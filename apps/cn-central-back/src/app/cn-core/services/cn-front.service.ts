import {Injectable} from '@nestjs/common';
import {CnCoreConfigService} from '../modules/cn-core-config/cn-core-config.service';

/**
 * Core service to manager front URLs
 */
@Injectable()
export class CnFrontService {

  constructor(private configService: CnCoreConfigService) {
  }

  public static getAdminUsersRoute(): string{
    return 'app/admin/users';
  }

  public static getProjectRoute(projectId: string): string{
    return 'app/project/' + projectId
  }

  public static getProjectCommentRoute(projectId: string): string{
    return `${CnFrontService.getProjectRoute(projectId)}?type=comments`
  }

  public static getReportRoute(projectId: string): string{
    return `app/project/report/${projectId}`
  }

  public static getExperimentRoute(projectId: string): string{
    return `app/project/experiment/${projectId}`
  }

  public static getConstellabDocRoute(docId: string): string{
    return `app/project/document/${docId}`
  }


  public getLoginUrl(): string {
    return this.getBaseWebsiteURL() + '/login';
  }

  public getSignupSpaceUrl(spaceDomain: string, invitationCode: string): string {
    return this.getSpaceWebsiteURL(spaceDomain) + '/signup-space/' + invitationCode;
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
