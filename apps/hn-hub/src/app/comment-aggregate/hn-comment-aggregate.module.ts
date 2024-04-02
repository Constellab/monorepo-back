import {Module} from '@nestjs/common';
import {HnCoreModule} from '../core/hn-core.module';
import {HnCommentController} from './hn-comment.controller';
import {HnCommentAggregateService} from './hn-comment-aggregate.service';
import {HnCommentStoryModule} from './comment-story/hn-comment-story.module';
import {HnCommentLiveTaskModule} from './comment-live-task/hn-comment-live-task.module';

@Module({
  imports: [
    HnCoreModule,
    HnCommentStoryModule,
    HnCommentLiveTaskModule
  ],
  controllers: [HnCommentController],
  providers: [HnCommentAggregateService],
  exports: [HnCommentAggregateService]
})
export class HnCommentAggregateModule {
}
