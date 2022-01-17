import {HttpModule, Module} from '@nestjs/common';
import {HnCoreConfigModule} from './modules/core-config/hn-core-config.module';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    HnCoreConfigModule,
    HttpModule,
  ],
  providers: [
  ],
  exports: [
    HnCoreConfigModule,

    // Providers
  ]
})
export class HnCoreModule {

}
