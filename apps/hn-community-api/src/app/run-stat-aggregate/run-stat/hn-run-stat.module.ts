import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnRunStat } from './hn-run-stat.entity';
import { HnRunStatService } from './hn-run-stat.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnRunStat])],
  exports: [TypeOrmModule, HnRunStatService],
  providers: [HnRunStatService],
})
export class HnRunStatModule {}
