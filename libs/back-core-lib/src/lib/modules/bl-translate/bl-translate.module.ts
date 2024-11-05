import { Module } from '@nestjs/common';
import { BlTranslateService } from './bl-translate.service';

@Module({
  providers: [BlTranslateService],
  exports: [BlTranslateService],
})
export class BlTranslateModule {}
