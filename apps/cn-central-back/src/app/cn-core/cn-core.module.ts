import {Module} from '@nestjs/common';
import {CnCoreConfigModule} from './modules/cn-core-config/cn-core-config.module';
import {CnFrontService} from './services/cn-front/cn-front.service';
import {BlExternalApiModule, BlRequestContextModule, BlTranslateModule} from '@monorepo/back-core-lib';
import {HttpModule} from '@nestjs/axios';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    CnCoreConfigModule,
    BlRequestContextModule,
    BlTranslateModule,
    BlExternalApiModule,
    HttpModule,
  ],
  providers: [
    CnFrontService,
  ],
  exports: [
    CnCoreConfigModule,
    BlRequestContextModule,
    BlTranslateModule,
    BlExternalApiModule,

    // Providers
    CnFrontService,
  ]
})
export class CnCoreModule {

}
