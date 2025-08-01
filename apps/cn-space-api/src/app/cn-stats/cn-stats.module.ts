import { Module } from '@nestjs/common';

import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnHierarchyObjectModule } from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.module';
import { CnNotesModule } from '../cn-folders-aggregate/cn-notes/cn-notes.module';
import { CnScenariosModule } from '../cn-folders-aggregate/cn-scenarios/cn-scenarios.module';
import { CnGroupsModule } from '../cn-groups/cn-groups.module';
import { CnLabsModule } from '../cn-labs/cn-labs.module';
import { CnStatsController } from './cn-stats.controller';
import { CnStatsService } from './cn-stats.service';

@Module({
  imports: [
    CnCoreModule,
    CnHierarchyObjectModule,
    CnScenariosModule,
    CnNotesModule,
    CnGroupsModule,
    CnLabsModule,
  ],
  controllers: [CnStatsController],
  providers: [CnStatsService],
})
export class CnStatsModule {}
