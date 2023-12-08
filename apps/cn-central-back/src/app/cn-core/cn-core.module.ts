import {Module} from '@nestjs/common';
import {CnFrontService} from './services/cn-front.service';
import {BlExternalApiModule, BlRequestContextModule, BlTranslateModule} from '@monorepo/back-core-lib';
import {HttpModule} from '@nestjs/axios';
import {CnConfigEntitySecurity} from './security/cn-config-entity.security';
import {CnCommandService} from './services/cn-command.service';
import {MulterModule} from '@nestjs/platform-express';

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
    MulterModule.register({
      limits: {fieldSize: 25 * 1024 * 1024}
    }),
  ],
  providers: [
    CnFrontService,
    CnConfigEntitySecurity,
    CnCommandService,
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
