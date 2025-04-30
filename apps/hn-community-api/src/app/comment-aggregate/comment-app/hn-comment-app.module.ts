import { Module } from '@nestjs/common';
import { HnCommentAppService } from './hn-comment-app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnCommentApp } from './hn-comment-app.entity';
import { HnCommunityAppAggregateModule } from '../../community-app-aggregate/hn-community-app-aggregate.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommentApp]), HnCommunityAppAggregateModule],
  providers: [HnCommentAppService],
  exports: [TypeOrmModule, HnCommentAppService],
})
export class HnCommentAppModule {}
