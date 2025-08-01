import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HnCoreConfigController } from './hn-core-config.controller';
import { HnCoreConfigService } from './hn-core-config.service';

@Module({
  imports: [ConfigModule],
  controllers: [HnCoreConfigController],
  providers: [HnCoreConfigService],
  exports: [HnCoreConfigService],
})
export class HnCoreConfigModule {}
