import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnSpacesModule } from '../../cn-spaces/cn-spaces.module';
import { CnHierarchyObjectTokenEntity } from './cn-hierarchy-object-token.entity';
import { CnHierarchyObjectTokenService } from './cn-hierarchy-object-token.service';
import { CnHierarchyObjectTokenGuard } from './cn-hierarchy-object-token-guard.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnHierarchyObjectTokenEntity]), CnCoreModule, CnSpacesModule],
  providers: [CnHierarchyObjectTokenService, CnHierarchyObjectTokenGuard],
  exports: [CnHierarchyObjectTokenService, CnHierarchyObjectTokenGuard],
})
export class CnHierarchyObjectTokenModule {}
