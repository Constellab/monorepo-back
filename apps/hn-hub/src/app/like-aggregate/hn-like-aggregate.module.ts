import {Module} from '@nestjs/common';
import {HnCoreModule} from '../core/hn-core.module';
import {HnLikeController} from './hn-like.controller';
import {HnLikeAggregateService} from './hn-like-aggregate.service';
import {HnLikeStoryModule} from './like-story/hn-like-story.module';
import {HnLikeLiveTaskModule} from './like-live-task/hn-like-live-task.module';
import {HnLikeBrickModule} from './like-brick/hn-like-brick.module';

@Module({
  imports: [
    HnCoreModule,
    HnLikeStoryModule,
    HnLikeLiveTaskModule,
    HnLikeBrickModule
  ],
  controllers: [HnLikeController],
  providers: [HnLikeAggregateService],
  exports: [HnLikeAggregateService]
})
export class HnLikeAggregateModule {
}
