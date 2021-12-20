import {Controller, Get, Logger} from '@nestjs/common';
import {CnEnvironmentProfile} from '../../model/config/cn-config.class';
import {CnCoreConfigService} from './cn-core-config.service';

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
}
