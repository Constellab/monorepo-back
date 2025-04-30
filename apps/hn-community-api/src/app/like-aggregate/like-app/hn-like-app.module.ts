import { Module } from '@nestjs/common';
import { HnLikeAppService } from './hn-like-app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnLikeApp } from './hn-like-app.entity';
import { HnCommunityAppAggregateModule } from '../../community-app-aggregate/hn-community-app-aggregate.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnLikeApp]), HnCommunityAppAggregateModule],
  providers: [HnLikeAppService],
  exports: [TypeOrmModule, HnLikeAppService],
})
export class HnLikeAppModule {}
