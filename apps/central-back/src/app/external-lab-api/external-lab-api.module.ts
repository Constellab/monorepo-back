import {HttpModule, Module} from '@nestjs/common';
import {ExternalLabApiService} from './external-lab-api.service';
import {CoreModule} from '../core/core.module';
import {ExternalLabExperimentService} from './external-lab-experiment.service';
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
    ExternalLabExperimentService,
    ExternalLabUserService,
  ],
  exports: [
    ExternalLabApiService,
    ExternalLabExperimentService,
    ExternalLabUserService,
  ]
})
export class ExternalLabApiModule {
}
