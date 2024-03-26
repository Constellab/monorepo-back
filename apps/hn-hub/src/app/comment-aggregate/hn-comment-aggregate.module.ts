import {Module} from '@nestjs/common';
import {HnCoreModule} from '../core/hn-core.module';
import {HnCommentStoryController} from './hn-comment-story.controller';
import {HnCommentAggregateService} from './hn-comment-aggregate.service';
import {HnCommentStoryModule} from './comment-story/hn-comment-story.module';
import {HnCommentLiveTaskController} from './hn-comment-live-task.controller';
import {HnCommentLiveTaskModule} from './comment-live-task/hn-comment-live-task.module';
import {HnCommentBrickModule} from './comment-brick/hn-comment-brick.module';
import {HnCommentBrickController} from './hn-comment-brick.controller';

@Module({
  imports: [
    HnCoreModule,
    HnCommentStoryModule,
    HnCommentLiveTaskModule,
    HnCommentBrickModule
  ],
  controllers: [HnCommentStoryController, HnCommentLiveTaskController, HnCommentBrickController],
  providers: [HnCommentAggregateService],
  exports: [HnCommentAggregateService]
})
export class HnCommentAggregateModule {
}
