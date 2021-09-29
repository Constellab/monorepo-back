import {HttpModule, Module} from '@nestjs/common';
import {CoreConfigModule} from './modules/core-config/core-config.module';
import {RequestContextModule} from './modules/request-context/request-context.module';
import {TokenService} from './services/token/token.service';
import {FrontService} from './services/front/front.service';
import { ExternalApiService } from './services/external-api/external-api.service';
import {ExternalApiErrorService} from './services/external-api/external-api-error.service';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    CoreConfigModule,
    RequestContextModule,
    HttpModule,
  ],
  providers: [
    TokenService,
    FrontService,
    ExternalApiService,
    ExternalApiErrorService,
  ],
  exports: [
    CoreConfigModule,
    RequestContextModule,

    // Providers
    TokenService,
    FrontService,
    ExternalApiService,
  ]
})
export class CoreModule {

}
