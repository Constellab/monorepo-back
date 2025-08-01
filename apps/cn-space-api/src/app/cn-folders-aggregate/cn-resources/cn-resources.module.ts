import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnResourceEntity } from './cn-resource.entity';
import { CnResourcesService } from './cn-resources.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnResourceEntity]), CnCoreModule],
  providers: [CnResourcesService],
  exports: [CnResourcesService],
})
export class CnResourcesModule {}
