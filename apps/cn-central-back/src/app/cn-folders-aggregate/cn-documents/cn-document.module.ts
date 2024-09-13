import { Module } from '@nestjs/common';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnFoldersModule } from '../cn-folders/cn-folders.module';
import { CnDocumentEntity } from './cn-document.entity';
import { CnDocumentService } from './cn-document.service';
import { CnHierarchyObjectModule } from '../cn_hierarchy_objects/cn-hierarchy-object.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnDocumentEntity]),

    CnCoreModule,
    CnFoldersModule,
    CnHierarchyObjectModule,
  ],
  providers: [CnDocumentService],
  exports: [CnDocumentService]
})
export class CnDocumentModule {
}
