import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnExperiment} from './cn-experiment.entity';
import {CnExperimentsService} from './cn-experiments.service';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {CnLabInstancesModule} from '../../cn-lab-instances/cn-lab-instances.module';
import {CnLabConfigsModule} from '../../cn-lab-configs/cn-lab-configs.module';
import {CnUsersModule} from '../../cn-users/cn-users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnExperiment]),

    CnCoreModule,

    // Other modules
    CnLabInstancesModule,
    CnLabConfigsModule,
    CnUsersModule
  ],
  providers: [CnExperimentsService],
  exports: [CnExperimentsService]
})
export class CnExperimentsModule {
}
