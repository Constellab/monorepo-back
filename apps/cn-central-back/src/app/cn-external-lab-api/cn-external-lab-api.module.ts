import {Module} from '@nestjs/common';
import {CnExternalLabApiService} from './cn-external-lab-api.service';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnExternalLabUserService} from './cn-external-lab-user.service';
import {CnExternalLabManagerApiService} from './cn-external-lab-manager-api.service';
import {HttpModule} from '@nestjs/axios';
import {CnExternalLabProjectService} from './cn-external-lab-project.service';

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
    CnExternalLabProjectService,
    CnExternalLabManagerApiService,
  ],
  exports: [
    CnExternalLabApiService,
    CnExternalLabUserService,
    CnExternalLabProjectService,
    CnExternalLabManagerApiService,
  ]
})
export class CnExternalLabApiModule {
}
