import {Module} from '@nestjs/common';
import {HnCoreConfigService} from './hn-core-config.service';
import {ConfigModule} from '@nestjs/config';
import { HnCoreConfigController } from './hn-core-config.controller';

@Module({
  imports: [ConfigModule],
  controllers: [HnCoreConfigController],
  providers: [HnCoreConfigService],
  exports: [HnCoreConfigService]
})
export class HnCoreConfigModule {
}
