import { Module } from '@nestjs/common';
import { CnFrontService } from './services/cn-front.service';
import { BlExternalApiModule, BlRequestContextModule, BlTranslateModule } from '@monorepo/back-core-lib';
import { HttpModule } from '@nestjs/axios';
import { CnConfigEntitySecurity } from './security/cn-config-entity.security';
import { CnCommandService } from './services/cn-command.service';
import { MulterModule } from '@nestjs/platform-express';
import { CnDbBackupCron } from './cron/cn-db-backup.cron';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    BlRequestContextModule,
    BlTranslateModule,
    BlExternalApiModule,
    HttpModule,

    // configure the multer module to accept field up to 25MB
    // to prevent error "Field value too long"
    // configure the multer module to accept files up to 100MB
    MulterModule.register({
      limits: {fieldSize: 25 * 1024 * 1024, fileSize: 100 * 1024 * 1024}
    }),
  ],
  providers: [
    CnFrontService,
    CnConfigEntitySecurity,
    CnCommandService,
    CnDbBackupCron,
  ],
  exports: [
    BlRequestContextModule,
    BlTranslateModule,
    BlExternalApiModule,
    MulterModule,

    // Providers
    CnFrontService,
    CnConfigEntitySecurity,
    CnCommandService,
  ]
})
export class CnCoreModule {

}
