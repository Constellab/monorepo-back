import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnTagKey } from './hn-tag-key.entity';
import { HnTagKeyService } from './hn-tag-key.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnTagKey]), HnCoreModule],
  providers: [HnTagKeyService],
  exports: [TypeOrmModule, HnTagKeyService],
})
export class HnTagKeyModule {}
