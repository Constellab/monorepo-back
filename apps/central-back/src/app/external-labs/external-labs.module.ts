import {Module} from '@nestjs/common';
import {ExternalLabsController} from './external-labs.controller';
import {LabInstancesModule} from '../lab-instances/lab-instances.module';
import {UsersModule} from '../users/users.module';
import {CoreModule} from '../core/core.module';
import {ReportsModule} from '../reports/reports.module';
import {ExperimentsModule} from '../experiments/experiments.module';
import {ProjectsModule} from '../projects/projects.module';

/**
 * Module for incoming calls from the labs
 */
@Module({
  controllers: [ExternalLabsController],
  imports: [
    LabInstancesModule,
    ReportsModule,
    UsersModule, // used by the lab auth
    CoreModule,
    ProjectsModule,
    ExperimentsModule,
  ],
})
export class ExternalLabsModule {
}
