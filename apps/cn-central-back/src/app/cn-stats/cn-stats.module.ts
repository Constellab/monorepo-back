import { Module } from '@nestjs/common';
import { CnStatsService } from './cn-stats.service';
import { CnStatsController } from './cn-stats.controller';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnExperimentsModule } from '../cn-folders-aggregate/cn-experiments/cn-experiments.module';
import { CnReportsModule } from '../cn-folders-aggregate/cn-reports/cn-reports.module';
import { CnGroupsModule } from '../cn-groups/cn-groups.module';
import { CnLabInstancesModule } from '../cn-lab-instances/cn-lab-instances.module';
import { CnHierarchyObjectModule } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.module';

@Module({
  imports: [
    CnCoreModule,
    CnHierarchyObjectModule,
    CnExperimentsModule,
    CnReportsModule,
    CnGroupsModule,
    CnLabInstancesModule
  ],
  controllers: [CnStatsController],
  providers: [
    CnStatsService
  ]
})
export class CnStatsModule {
}
