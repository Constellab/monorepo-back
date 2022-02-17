import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnExperiment} from './cn-experiment.entity';
import {CnExperimentsController} from './cn-experiments.controller';
import {CnExperimentsService} from './cn-experiments.service';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnExperimentsSecurityLayer} from './cn-experiments-security-layer.service';
import {CnLabInstancesModule} from '../cn-lab-instances/cn-lab-instances.module';
import {CnExternalLabApiModule} from '../cn-external-lab-api/cn-external-lab-api.module';
import {CnProjectsModule} from '../cn-projects/cn-projects.module';
import {CnReportsModule} from '../cn-reports/cn-reports.module';
import {CnLabConfigsModule} from '../cn-lab-configs/cn-lab-configs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnExperiment]),

    CnCoreModule,

    // Other modules
    CnProjectsModule,
    CnLabInstancesModule,
    CnExternalLabApiModule,
    CnReportsModule,
    CnLabConfigsModule,
  ],
  controllers: [CnExperimentsController],
  providers: [CnExperimentsService, CnExperimentsSecurityLayer],
  exports: [CnExperimentsService, CnExperimentsSecurityLayer]
})
export class CnExperimentsModule {
}
