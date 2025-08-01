import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnSpace } from './hn-space.entity';
import { HnSpaceService } from './hn-space.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnSpace]), HnCoreModule],
  providers: [HnSpaceService],
  exports: [TypeOrmModule, HnSpaceService],
})
export class HnSpaceModule {}
