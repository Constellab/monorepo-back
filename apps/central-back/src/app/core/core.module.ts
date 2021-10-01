import {HttpModule, Module} from '@nestjs/common';
import {CoreConfigModule} from './modules/core-config/core-config.module';
import {TokenService} from './services/token/token.service';
import {FrontService} from './services/front/front.service';
import {BlExternalApiModule, BlRequestContextModule, BlTranslateModule} from '@monorepo/back-core-lib';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    CoreConfigModule,
    BlRequestContextModule,
    BlTranslateModule,
    BlExternalApiModule,
    HttpModule,
  ],
  providers: [
    TokenService,
    FrontService,
  ],
  exports: [
    CoreConfigModule,
    BlRequestContextModule,
    BlTranslateModule,
    BlExternalApiModule,

    // Providers
    TokenService,
    FrontService,
  ]
})
export class CoreModule {

}
