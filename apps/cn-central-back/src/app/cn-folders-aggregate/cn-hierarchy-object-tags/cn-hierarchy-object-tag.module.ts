import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnHierarchyObjectTagEntity } from './cn-hierarchy-object-tag.entity';
import { CnHierarchyObjectTagHistoryEntity } from './cn-hierarchy-object-tag-history.entity';
import { CnHierarchyObjectTagService } from './cn-hierarchy-object-tag.service';
import { CnHierarchyObjectTagHistoryService } from './cn-hierarchy-object-tag-history.service';
import { CnHierarchyObjectTagAggregateService } from './cn-hierarchy-object-tag-aggregate.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnHierarchyObjectTagEntity, CnHierarchyObjectTagHistoryEntity])],
  providers: [
    CnHierarchyObjectTagAggregateService,
    CnHierarchyObjectTagService,
    CnHierarchyObjectTagHistoryService,
  ],
  exports: [CnHierarchyObjectTagAggregateService],
})
export class CnHierarchyObjectTagModule {}
