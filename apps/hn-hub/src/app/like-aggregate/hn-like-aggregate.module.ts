import {Module} from '@nestjs/common';
import {HnCoreModule} from '../core/hn-core.module';
import {HnLikeStoryController} from './hn-like-story.controller';
import {HnLikeAggregateService} from './hn-like-aggregate.service';
import {HnLikeStoryModule} from './like-story/hn-like-story.module';
import {HnLikeLiveTaskModule} from './like-live-task/hn-like-live-task.module';
import {HnLikeLiveTaskController} from './hn-like-live-task.controller';
import {HnLikeBrickModule} from './like-brick/hn-like-brick.module';
import {HnLikeBrickController} from './hn-like-brick.controller';

@Module({
  imports: [
    HnCoreModule,
    HnLikeStoryModule,
    HnLikeLiveTaskModule,
    HnLikeBrickModule
  ],
  controllers: [HnLikeStoryController, HnLikeLiveTaskController, HnLikeBrickController],
  providers: [HnLikeAggregateService],
  exports: [HnLikeAggregateService]
})
export class HnLikeAggregateModule {
}
