import {HttpModule, Module} from '@nestjs/common';
import {CnExternalLabApiService} from './cn-external-lab-api.service';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnExternalLabUserService} from './cn-external-lab-user.service';
import {CnExternalLabManagerApiService} from './cn-external-lab-manager-api.service';

/**
 * Module for outgoing api call to the labs
 */
@Module({
  imports: [
    CnCoreModule,
    HttpModule,
  ],
  providers: [
    CnExternalLabApiService,
    CnExternalLabUserService,
    CnExternalLabManagerApiService,
  ],
  exports: [
    CnExternalLabApiService,
    CnExternalLabUserService,
    CnExternalLabManagerApiService,
  ]
})
export class CnExternalLabApiModule {
}
