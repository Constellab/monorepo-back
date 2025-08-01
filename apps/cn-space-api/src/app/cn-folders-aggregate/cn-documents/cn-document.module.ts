import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnFoldersModule } from '../cn-folders/cn-folders.module';
import { CnHierarchyObjectModule } from '../cn-hierarchy-objects/cn-hierarchy-object.module';
import { CnDocumentEntity } from './cn-document.entity';
import { CnDocumentService } from './cn-document.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnDocumentEntity]),

    CnCoreModule,
    CnFoldersModule,
    CnHierarchyObjectModule,
  ],
  providers: [CnDocumentService],
  exports: [CnDocumentService],
})
export class CnDocumentModule {}
