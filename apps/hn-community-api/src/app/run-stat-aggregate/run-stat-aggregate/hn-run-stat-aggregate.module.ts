import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnRunStatAggregate } from './hn-run-stat-aggregate.entity';
import { HnRunStatAggregateService } from './hn-run-stat-aggregate.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnRunStatAggregate])],
  exports: [TypeOrmModule, HnRunStatAggregateService],
  providers: [HnRunStatAggregateService],
})
export class HnRunStatAggregateModule {}
