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
    return this.getWebsiteURL() + 'login';
  }

  private getWebsiteURL(): string {
    return this.configService.getWebsiteURL();
  }
}
