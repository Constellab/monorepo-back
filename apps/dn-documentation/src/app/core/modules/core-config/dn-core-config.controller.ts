import {Controller, Get, Logger} from '@nestjs/common';
import {EnvironmentProfile} from '../../model/config/dn-config.class';
import {DnCoreConfigService} from './dn-core-config.service';

@Controller('core-config')
export class DnCoreConfigController {
  private readonly logger = new Logger(DnCoreConfigController.name);


  constructor(private coreConfigService: DnCoreConfigService) {
    this.logger.log('Environment Profile : ' + this.getEnvironmentProfile());
  }


  @Get('environment-profile')
  getEnvironmentProfile(): EnvironmentProfile {
    return this.coreConfigService.getEnvironmentProfile();
  }
}
