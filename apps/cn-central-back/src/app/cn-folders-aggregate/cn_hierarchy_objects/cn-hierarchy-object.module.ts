import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnHierarchyObjectEntity } from './cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from './cn-hierarchy-object.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnHierarchyObjectEntity]),

    CnCoreModule
  ],
  providers: [
    CnHierarchyObjectService
  ],
  exports: [
    CnHierarchyObjectService
  ]
})
export class CnHierarchyObjectModule {
}
