import {Module} from '@nestjs/common';
import {DnCoreConfigService} from './dn-core-config.service';
import {ConfigModule} from '@nestjs/config';
import { DnCoreConfigController } from './dn-core-config.controller';

@Module({
  imports: [ConfigModule],
  providers: [DnCoreConfigService],
  exports: [DnCoreConfigService],
  controllers: [DnCoreConfigController]
})
export class DnCoreConfigModule {
}
