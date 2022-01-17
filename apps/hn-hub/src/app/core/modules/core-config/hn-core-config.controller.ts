import {Controller, Get, Logger} from '@nestjs/common';
import {EnvironmentProfile} from '../../model/config/hn-config.class';
import {HnCoreConfigService} from './hn-core-config.service';

@Controller('core-config')
export class HnCoreConfigController {
  private readonly logger = new Logger(HnCoreConfigController.name);


  constructor(private coreConfigService: HnCoreConfigService) {
    this.logger.log('Environment Profile : ' + this.getEnvironmentProfile());
  }


  @Get('environment-profile')
  getEnvironmentProfile(): EnvironmentProfile {
    return this.coreConfigService.getEnvironmentProfile();
  }
}
