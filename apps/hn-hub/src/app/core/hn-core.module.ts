import { Module } from '@nestjs/common';
import { HnCoreConfigModule } from './modules/core-config/hn-core-config.module';
import { BlExternalApiModule, BlRequestContextModule, BlTranslateModule } from '@monorepo/back-core-lib';
import { HttpModule } from '@nestjs/axios';
import { HnFrontService } from './service/hn-front.service';
import { HnDbBackupCron } from './cron/hn-db-backup.cron';
import { MulterModule } from '@nestjs/platform-express';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    HttpModule,

    BlTranslateModule,
    BlRequestContextModule,
    BlExternalApiModule,

    HnCoreConfigModule,

    // configure the multer module to accept files up to 100MB
    MulterModule.register({
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  ],
  providers: [HnFrontService, HnDbBackupCron],
  exports: [
    HnCoreConfigModule,

    BlRequestContextModule,
    BlTranslateModule,
    BlExternalApiModule,

    // Providers
    HnFrontService,
  ],
})
export class HnCoreModule {}
