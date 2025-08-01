import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnCommunityAppStat } from './hn-community-app-stat.entity';
import { HnCommunityAppStatService } from './hn-community-app-stat.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommunityAppStat]), HnCoreModule],
  exports: [TypeOrmModule, HnCommunityAppStatService],
  providers: [HnCommunityAppStatService],
})
export class HnCommunityAppStatModule {}
