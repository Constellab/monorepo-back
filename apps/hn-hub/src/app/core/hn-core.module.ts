import {Module} from '@nestjs/common';
import {HnCoreConfigModule} from './modules/core-config/hn-core-config.module';
import {BlRequestContextModule, BlTranslateModule} from '@monorepo/back-core-lib';
import {HttpModule} from '@nestjs/axios';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    HnCoreConfigModule,
    HttpModule,
    BlTranslateModule,
    BlRequestContextModule
  ],
  providers: [
  ],
  exports: [
    HnCoreConfigModule,
    BlRequestContextModule,
    BlTranslateModule
    // Providers
  ]
})
export class HnCoreModule {

}
