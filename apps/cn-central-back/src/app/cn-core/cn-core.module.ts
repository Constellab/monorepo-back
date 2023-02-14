import {Module} from '@nestjs/common';
import {CnFrontService} from './services/cn-front.service';
import {BlExternalApiModule, BlRequestContextModule, BlTranslateModule} from '@monorepo/back-core-lib';
import {HttpModule} from '@nestjs/axios';
import {CnConfigEntitySecurity} from './security/cn-config-entity.security';
import {CnCommandService} from './services/cn-command.service';

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

    // Providers
    CnFrontService,
    CnConfigEntitySecurity,
    CnCommandService,
  ]
})
export class CnCoreModule {

}
