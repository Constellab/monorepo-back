import { Module } from '@nestjs/common';

import { HnCoreModule } from '../core/hn-core.module';
import { HnCommentAgentModule } from './comment-agent/hn-comment-agent.module';
import { HnCommentAppModule } from './comment-app/hn-comment-app.module';
import { HnCommentStoryModule } from './comment-story/hn-comment-story.module';
import { HnCommentTagModule } from './comment-tag/hn-comment-tag.module';
import { HnCommentController } from './hn-comment.controller';
import { HnCommentAggregateService } from './hn-comment-aggregate.service';

@Module({
  imports: [HnCoreModule, HnCommentStoryModule, HnCommentAgentModule, HnCommentAppModule, HnCommentTagModule],
  controllers: [HnCommentController],
  providers: [HnCommentAggregateService],
  exports: [HnCommentAggregateService],
})
export class HnCommentAggregateModule {}
