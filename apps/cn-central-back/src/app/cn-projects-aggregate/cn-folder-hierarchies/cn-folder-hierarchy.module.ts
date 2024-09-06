import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnFolderHierarchyEntity } from './cn-folder-hierarchy.entity';
import { CnFolderHierarchyService } from './cn-folder-hierarchy.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnFolderHierarchyEntity]),

    CnCoreModule
  ],
  providers: [
    CnFolderHierarchyService
  ],
  exports: [
    CnFolderHierarchyService
  ]
})
export class CnFolderHierarchyModule {
}
