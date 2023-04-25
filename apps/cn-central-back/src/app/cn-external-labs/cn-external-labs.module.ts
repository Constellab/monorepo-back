import {Module} from '@nestjs/common';
import {CnExternalLabsController} from './cn-external-labs.controller';
import {CnLabInstancesModule} from '../cn-lab-instances/cn-lab-instances.module';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnProjectsAggregateModule} from '../cn-projects-aggregate/cn-project-aggregate.module';
import {CnSpacesModule} from '../cn-spaces/cn-spaces.module';
import {CnExternalLabsManagerController} from './cn-external-labs-manager.controller';

/**
 * Module for incoming calls from the labs
 */
@Module({
  controllers: [CnExternalLabsController, CnExternalLabsManagerController],
  imports: [
    CnLabInstancesModule,
    CnUsersModule, // used by the lab auth guard
    CnSpacesModule, // used by the lab auth guard
    CnCoreModule,
    CnProjectsAggregateModule
  ],
})
export class CnExternalLabsModule {
}
