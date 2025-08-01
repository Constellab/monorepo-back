import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnBrickAggregateModule } from '../../brick-aggregate/hn-brick-aggregate.module';
import { HnLikeBrick } from './hn-like-brick.entity';
import { HnLikeBrickService } from './hn-like-brick.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnLikeBrick]), HnBrickAggregateModule],
  providers: [HnLikeBrickService],
  exports: [TypeOrmModule, HnLikeBrickService],
})
export class HnLikeBrickModule {}
