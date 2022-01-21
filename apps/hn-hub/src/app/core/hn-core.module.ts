import {HttpModule, Module} from '@nestjs/common';
import {HnCoreConfigModule} from './modules/core-config/hn-core-config.module';
import {BlRequestContextModule} from '@monorepo/back-core-lib';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    HnCoreConfigModule,
    HttpModule,
    BlRequestContextModule
  ],
  providers: [
  ],
  exports: [
    HnCoreConfigModule,
    BlRequestContextModule
    // Providers
  ]
})
export class HnCoreModule {

}
