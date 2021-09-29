import {Injectable} from '@nestjs/common';
import {CoreConfigService} from '../../modules/core-config/core-config.service';

/**
 * Core service to manager front URLs
 */
@Injectable()
export class FrontService {

  constructor(private configService: CoreConfigService) {
  }

  public getLoginUrl(): string {
    return this.getWebsiteURL() + 'login';
  }

  private getWebsiteURL(): string {
    return this.configService.getWebsiteURL();
  }
}
