import { Module } from '@nestjs/common';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnProjectsModule } from '../cn-projects/cn-projects.module';
import { CnProjectDocument } from './cn-project-document.entity';
import { CnProjectDocumentService } from './cn-project-document.service';
import { CnFolderHierarchyModule } from '../cn-folder-hierarchies/cn-folder-hierarchy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProjectDocument]),

    CnCoreModule,
    CnProjectsModule,
    CnFolderHierarchyModule,
  ],
  providers: [CnProjectDocumentService],
  exports: [CnProjectDocumentService]
})
export class CnProjectDocumentModule {
}
