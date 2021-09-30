import {HttpModule, Module} from '@nestjs/common';
import {CoreConfigModule} from './modules/core-config/core-config.module';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    CoreConfigModule,
    HttpModule,
  ],
  providers: [
  ],
  exports: [
    CoreConfigModule,

    // Providers
  ]
})
export class CoreModule {

}
