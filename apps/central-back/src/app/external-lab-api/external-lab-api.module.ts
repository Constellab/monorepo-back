import {HttpModule, Module} from '@nestjs/common';
import {ExternalLabApiService} from './external-lab-api.service';
import {CoreModule} from '../core/core.module';
import {ExternalLabUserService} from './external-lab-user.service';

/**
 * Module for outgoing api call to the labs
 */
@Module({
  imports: [
    CoreModule,
    HttpModule,
  ],
  providers: [
    ExternalLabApiService,
    ExternalLabUserService,
  ],
  exports: [
    ExternalLabApiService,
    ExternalLabUserService,
  ]
})
export class ExternalLabApiModule {
}
