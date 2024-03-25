import {Module} from '@nestjs/common';
import {HnCoreModule} from '../core/hn-core.module';
import {HnCommentStoryController} from './hn-comment-story.controller';
import {HnCommentAggregateService} from './hn-comment-aggregate.service';
import {HnCommentStoryModule} from './comment-story/hn-comment-story.module';

@Module({
  imports: [
    HnCoreModule,
    HnCommentStoryModule
  ],
  controllers: [HnCommentStoryController],
  providers: [HnCommentAggregateService],
  exports: [HnCommentAggregateService]
})
export class HnCommentAggregateModule {
}
