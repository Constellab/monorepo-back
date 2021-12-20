import {Module} from '@nestjs/common';
import {CnExternalLabsController} from './cn-external-labs.controller';
import {CnLabInstancesModule} from '../cn-lab-instances/cn-lab-instances.module';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnReportsModule} from '../cn-reports/cn-reports.module';
import {CnExperimentsModule} from '../cn-experiments/cn-experiments.module';
import {CnProjectsModule} from '../cn-projects/cn-projects.module';

/**
 * Module for incoming calls from the labs
 */
@Module({
  controllers: [CnExternalLabsController],
  imports: [
    CnLabInstancesModule,
    CnReportsModule,
    CnUsersModule, // used by the lab auth
    CnCoreModule,
    CnProjectsModule,
    CnExperimentsModule,
  ],
})
export class CnExternalLabsModule {
}
