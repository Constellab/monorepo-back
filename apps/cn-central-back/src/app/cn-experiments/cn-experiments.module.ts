import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnExperiment} from './cn-experiment.entity';
import {CnExperimentsController} from './cn-experiments.controller';
import {CnExperimentsService} from './cn-experiments.service';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnExperimentStatusHistory} from './cn-experiment-status-history.entity';
import {CnExperimentsSecurityLayer} from './cn-experiments-security-layer.service';
import {CnLabInstancesModule} from '../cn-lab-instances/cn-lab-instances.module';
import {CnExternalLabApiModule} from '../cn-external-lab-api/cn-external-lab-api.module';
import {CnProjectsModule} from '../cn-projects/cn-projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnExperiment, CnExperimentStatusHistory]),

    CnCoreModule,

    // Other modules
    CnProjectsModule,
    CnLabInstancesModule,
    CnExternalLabApiModule,
  ],
  controllers: [CnExperimentsController],
  providers: [CnExperimentsService, CnExperimentsSecurityLayer],
  exports: [CnExperimentsService, CnExperimentsSecurityLayer]
})
export class CnExperimentsModule {
}
