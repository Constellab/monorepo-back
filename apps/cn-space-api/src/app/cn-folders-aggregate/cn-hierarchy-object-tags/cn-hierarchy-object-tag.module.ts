import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnHierarchyObjectTagEntity } from './cn-hierarchy-object-tag.entity';
import { CnHierarchyObjectTagHistoryEntity } from './cn-hierarchy-object-tag-history.entity';
import { CnHierarchyObjectTagService } from './cn-hierarchy-object-tag.service';
import { CnHierarchyObjectTagHistoryService } from './cn-hierarchy-object-tag-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnHierarchyObjectTagEntity, CnHierarchyObjectTagHistoryEntity])],
  providers: [CnHierarchyObjectTagService, CnHierarchyObjectTagHistoryService],
  exports: [CnHierarchyObjectTagService, CnHierarchyObjectTagHistoryService],
})
export class CnHierarchyObjectTagModule {}
