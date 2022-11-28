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

  public getSignupSpaceUrl(spaceDomain: string, invitationCode: string): string {
    return this.getSpaceWebsiteURL(spaceDomain) + '/signup-space/' + invitationCode;
  }

  /**
   * Get the base url of the website (without the url of the space)
   */
  public getBaseWebsiteURL(): string {
    return 'https://' + this.configService.getCentralFrontDomain();
  }

  /**
   * Get the base url of the website (without the url of the space)
   */
  public getSpaceWebsiteURL(spaceDomain: string): string {
    return `https://${spaceDomain}.${this.configService.getCentralFrontDomain()}`;
  }
}
