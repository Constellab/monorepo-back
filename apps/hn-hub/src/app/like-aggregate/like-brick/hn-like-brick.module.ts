import { Module } from '@nestjs/common';
import { HnLikeBrickService } from './hn-like-brick.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnLikeBrick } from './hn-like-brick.entity';
import { HnBrickAggregateModule } from '../../brick-aggregate/hn-brick-aggregate.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnLikeBrick]), HnBrickAggregateModule],
  providers: [HnLikeBrickService],
  exports: [TypeOrmModule, HnLikeBrickService],
})
export class HnLikeBrickModule {}
