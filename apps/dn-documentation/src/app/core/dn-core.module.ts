import {HttpModule, Module} from '@nestjs/common';
import {DnCoreConfigModule} from './modules/core-config/dn-core-config.module';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    DnCoreConfigModule,
    HttpModule,
  ],
  providers: [
  ],
  exports: [
    DnCoreConfigModule,

    // Providers
  ]
})
export class DnCoreModule {

}
