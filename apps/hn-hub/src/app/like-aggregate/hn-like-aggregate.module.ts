import {Module} from '@nestjs/common';
import {HnCoreModule} from '../core/hn-core.module';
import {HnLikeStoryController} from './hn-like-story.controller';
import {HnLikeAggregateService} from './hn-like-aggregate.service';
import {HnLikeStoryModule} from './like-story/hn-like-story.module';

@Module({
  imports: [
    HnCoreModule,
    HnLikeStoryModule
  ],
  controllers: [HnLikeStoryController],
  providers: [HnLikeAggregateService],
  exports: [HnLikeAggregateService]
})
export class HnLikeAggregateModule {
}
