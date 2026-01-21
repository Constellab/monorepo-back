import { BlExternalApiModule, BlRequestContextModule, BlTranslateModule } from '@monorepo/back-core-lib';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { CnDbBackupCron } from './cron/cn-db-backup.cron';
import { CnConfigEntitySecurity } from './security/cn-config-entity.security';
import { CnCaptchaService } from './services/cn-captcha.service';
import { CnCommandService } from './services/cn-command.service';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [BlRequestContextModule, BlTranslateModule, BlExternalApiModule, HttpModule, MulterModule],
  providers: [CnConfigEntitySecurity, CnCommandService, CnDbBackupCron, CnCaptchaService],
  exports: [
    BlRequestContextModule,
    BlTranslateModule,
    BlExternalApiModule,
    MulterModule,

    CnConfigEntitySecurity,
    CnCommandService,
    CnCaptchaService,
  ],
})
export class CnCoreModule {}
