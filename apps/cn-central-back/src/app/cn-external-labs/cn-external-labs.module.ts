import {Module} from '@nestjs/common';
import {CnExternalLabsController} from './cn-external-labs.controller';
import {CnLabInstancesModule} from '../cn-lab-instances/cn-lab-instances.module';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnProjectsAggregateModule} from '../cn-projects-aggregate/cn-project-aggregate.module';
import {CnOrganizationsModule} from '../cn-organizations/cn-organizations.module';

/**
 * Module for incoming calls from the labs
 */
@Module({
  controllers: [CnExternalLabsController],
  imports: [
    CnLabInstancesModule,
    CnUsersModule, // used by the lab auth guard
    CnOrganizationsModule, // used by the lab auth guard
    CnCoreModule,
    CnProjectsAggregateModule
  ],
})
export class CnExternalLabsModule {
}
