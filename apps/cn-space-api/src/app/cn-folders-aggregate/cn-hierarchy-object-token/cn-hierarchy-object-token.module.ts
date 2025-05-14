import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnHierarchyObjectTokenEntity } from './cn-hierarchy-object-token.entity';
import { CnHierarchyObjectTokenService } from './cn-hierarchy-object-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnHierarchyObjectTokenEntity]), CnCoreModule],
  providers: [CnHierarchyObjectTokenService],
  exports: [CnHierarchyObjectTokenService],
})
export class CnHierarchyObjectTokenModule {}
