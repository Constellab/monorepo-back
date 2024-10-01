import { Module } from '@nestjs/common';
import { CnStatsService } from './cn-stats.service';
import { CnStatsController } from './cn-stats.controller';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnExperimentsModule } from '../cn-folders-aggregate/cn-experiments/cn-experiments.module';
import { CnNotesModule } from '../cn-folders-aggregate/cn-notes/cn-notes.module';
import { CnGroupsModule } from '../cn-groups/cn-groups.module';
import { CnLabsModule } from '../cn-labs/cn-labs.module';
import { CnHierarchyObjectModule } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.module';

@Module({
  imports: [
    CnCoreModule,
    CnHierarchyObjectModule,
    CnExperimentsModule,
    CnNotesModule,
    CnGroupsModule,
    CnLabsModule
  ],
  controllers: [CnStatsController],
  providers: [
    CnStatsService
  ]
})
export class CnStatsModule {
}
