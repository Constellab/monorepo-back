import {Injectable} from '@nestjs/common';
import {CnCoreConfigService} from '../modules/cn-core-config/cn-core-config.service';

/**
 * Core service to manager front URLs
 */
@Injectable()
export class CnFrontService {

  constructor(private configService: CnCoreConfigService) {
  }

  public getLoginUrl(): string {
    return this.getBaseWebsiteURL() + '/login';
  }

  public getSignupOrganizationUrl(organizationDomain: string, invitationCode: string): string {
    return this.getOrganizationWebsiteURL(organizationDomain) + '/signup-organization/' + invitationCode;
  }

  /**
   * Get the base url of the website (without the url of the organization)
   */
  public getBaseWebsiteURL(): string {
    return 'https://' + this.configService.getFrontDomain();
  }

  /**
   * Get the base url of the website (without the url of the organization)
   */
  public getOrganizationWebsiteURL(organizationDomain: string): string {
    return `https://${organizationDomain}.${this.configService.getFrontDomain()}`;
  }
}
