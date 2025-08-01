import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCommunityAppAggregateModule } from '../../community-app-aggregate/hn-community-app-aggregate.module';
import { HnCommentApp } from './hn-comment-app.entity';
import { HnCommentAppService } from './hn-comment-app.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommentApp]), HnCommunityAppAggregateModule],
  providers: [HnCommentAppService],
  exports: [TypeOrmModule, HnCommentAppService],
})
export class HnCommentAppModule {}
