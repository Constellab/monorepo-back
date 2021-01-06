import {Controller, Get, Logger} from '@nestjs/common';
import {EnvironmentProfile} from '../../model/config/config.class';
import {CoreConfigService} from './core-config.service';

@Controller('core-config')
export class CoreConfigController {
  private readonly logger = new Logger(CoreConfigController.name);


  constructor(private coreConfigService: CoreConfigService) {
    this.logger.log('Environment Profile : ' + this.getEnvironmentProfile());
  }


  @Get('environment-profile')
  getEnvironmentProfile(): EnvironmentProfile {
    return this.coreConfigService.getEnvironmentProfile();
  }
}
