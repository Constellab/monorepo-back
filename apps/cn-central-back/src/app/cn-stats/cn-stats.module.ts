import {Module} from '@nestjs/common';
import {CnStatsService} from './cn-stats.service';
import {CnStatsController} from './cn-stats.controller';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnProjectsModule} from '../cn-projects-aggregate/cn-projects/cn-projects.module';
import {CnExperimentsModule} from '../cn-projects-aggregate/cn-experiments/cn-experiments.module';
import {CnReportsModule} from '../cn-projects-aggregate/cn-reports/cn-reports.module';
import {CnGroupsModule} from '../cn-groups/cn-groups.module';
import {CnLabInstancesModule} from '../cn-lab-instances/cn-lab-instances.module';

@Module({
  imports: [
    CnCoreModule,
    CnProjectsModule,
    CnExperimentsModule,
    CnReportsModule,
    CnGroupsModule,
    CnLabInstancesModule
  ],
  controllers: [CnStatsController],
  providers: [
    CnStatsService
  ],
})
export class CnStatsModule {
}
