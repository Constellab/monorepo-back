import { Module } from '@nestjs/common';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnSettings } from './cn-settings.entity';
import { CnSettingsService } from './cn-settings.service';
import { CnSettingsController } from './cn-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CnSettings]), CnCoreModule],
  providers: [CnSettingsService],
  controllers: [CnSettingsController],
})
export class CnSettingsModule {}
