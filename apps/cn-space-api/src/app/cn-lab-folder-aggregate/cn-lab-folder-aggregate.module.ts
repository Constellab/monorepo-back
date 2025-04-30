import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnExternalLabApiModule } from '../cn-external-lab-api/cn-external-lab-api.module';
import { CnFoldersAggregateModule } from '../cn-folders-aggregate/cn-folders-aggregate.module';
import { CnLabFolderAggregateService } from './cn-lab-folder-aggregate.service';
import { CnLabsModule } from '../cn-labs/cn-labs.module';
import { CnLabFolderListener } from './cn-lab-folder-listener.service';
import { CnLabFolderService } from './cn-lab-folder.service';
import { CnLabFolderEntity } from './cn-lab-folder.entity';
import { CnLabFolderController } from './cn-lab-folder.controller';
import { CnHierarchyObjectModule } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.module';
import { CnFoldersModule } from '../cn-folders-aggregate/cn-folders/cn-folders.module';
import { CnResourcesController } from '../cn-folders-aggregate/cn-resources/cn-resources.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnLabFolderEntity]),

    CnCoreModule,
    CnExternalLabApiModule,

    CnFoldersAggregateModule,
    CnLabsModule,
    CnHierarchyObjectModule,
    CnFoldersModule,
  ],
  providers: [CnLabFolderAggregateService, CnLabFolderListener, CnLabFolderService],
  exports: [CnLabFolderAggregateService],
  controllers: [CnLabFolderController, CnResourcesController],
})
export class CnLabFolderAggregateModule {}
