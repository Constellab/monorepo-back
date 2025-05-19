import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnTagValue } from './hn-tag-value.entity';
import { HnCoreModule } from '../../core/hn-core.module';
import { HnTagValueService } from './hn-tag-value.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnTagValue]), HnCoreModule],
  providers: [HnTagValueService],
  exports: [TypeOrmModule, HnTagValueService],
})
export class HnTagValueModule {}
