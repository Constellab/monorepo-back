import {Module} from '@nestjs/common';
import {CnCoreConfigService} from './cn-core-config.service';
import {ConfigModule} from '@nestjs/config';
import {CnCoreConfigController} from './cn-core-config.controller';

@Module({
  imports: [ConfigModule],
  providers: [CnCoreConfigService],
  exports: [CnCoreConfigService],
  controllers: [CnCoreConfigController]
})
export class CnCoreConfigModule {
}
