import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnSettingsController } from './cn-settings.controller';
import { CnSettings } from './cn-settings.entity';
import { CnSettingsService } from './cn-settings.service';
import { CnYoutubeService } from './cn-youtube.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnSettings]), CnCoreModule],
  providers: [CnSettingsService, CnYoutubeService],
  controllers: [CnSettingsController],
  exports: [CnSettingsService],
})
export class CnSettingsModule {}
