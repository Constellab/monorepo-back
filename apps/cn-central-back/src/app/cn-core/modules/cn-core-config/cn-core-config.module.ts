import {Module} from '@nestjs/common';
import {CnCoreConfigService} from './cn-core-config.service';
import {ConfigModule} from '@nestjs/config';
import {CnCoreConfigController} from './cn-core-config.controller';
import {SnCoreConfigService} from './sn-core-config.service';

@Module({
  imports: [ConfigModule],
  providers: [CnCoreConfigService, SnCoreConfigService],
  exports: [CnCoreConfigService, SnCoreConfigService],
  controllers: [CnCoreConfigController]
})
export class CnCoreConfigModule {
}
