import { Controller, Get, Logger } from '@nestjs/common';

import { CnEnvironmentProfile } from '../../model/config/cn-config.class';
import { CnCoreConfigService } from './cn-core-config.service';

@Controller('core-config')
export class CnCoreConfigController {
  private readonly logger = new Logger(CnCoreConfigController.name);

  constructor(private coreConfigService: CnCoreConfigService) {
    this.logger.log('Environment Profile : ' + this.getEnvironmentProfile());
  }

  @Get('environment-profile')
  getEnvironmentProfile(): CnEnvironmentProfile {
    return this.coreConfigService.getEnvironmentProfile();
  }

  /**
   * The domains this instance creates labs on. Exposed because they used to be the
   * `CnLabDomain` enum, which the front had its own copy of; they now come from this
   * instance's environment, so the front has no way to know them.
   */
  @Get('lab-domains')
  getLabDomains(): string[] {
    return this.coreConfigService.getLabAllowedDomains();
  }
}
