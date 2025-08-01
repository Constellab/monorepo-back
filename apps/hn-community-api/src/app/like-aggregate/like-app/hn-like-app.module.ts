import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCommunityAppAggregateModule } from '../../community-app-aggregate/hn-community-app-aggregate.module';
import { HnLikeApp } from './hn-like-app.entity';
import { HnLikeAppService } from './hn-like-app.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnLikeApp]), HnCommunityAppAggregateModule],
  providers: [HnLikeAppService],
  exports: [TypeOrmModule, HnLikeAppService],
})
export class HnLikeAppModule {}
