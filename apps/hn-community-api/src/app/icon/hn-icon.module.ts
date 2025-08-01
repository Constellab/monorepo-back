import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../core/hn-core.module';
import { HnSpaceAggregateModule } from '../space-aggregate/hn-space-aggregate.module';
import { HnIconController } from './hn-icon.controller';
import { HnIcon } from './hn-icon.entity';
import { HnIconService } from './hn-icon.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnIcon]), HnCoreModule, HnSpaceAggregateModule],
  exports: [TypeOrmModule, HnIconService],
  controllers: [HnIconController],
  providers: [HnIconService],
})
export class HnIconModule {}
