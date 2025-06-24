import { Module } from '@nestjs/common';
import { HnCoreModule } from '../core/hn-core.module';
import { HnLikeController } from './hn-like.controller';
import { HnLikeAggregateService } from './hn-like-aggregate.service';
import { HnLikeStoryModule } from './like-story/hn-like-story.module';
import { HnLikeAgentModule } from './like-agent/hn-like-agent.module';
import { HnLikeBrickModule } from './like-brick/hn-like-brick.module';
import { HnLikeAppModule } from './like-app/hn-like-app.module';
import { HnLikeTagModule } from './like-tag/hn-like-tag.module';

@Module({
  imports: [
    HnCoreModule,
    HnLikeStoryModule,
    HnLikeAgentModule,
    HnLikeBrickModule,
    HnLikeAppModule,
    HnLikeTagModule,
  ],
  controllers: [HnLikeController],
  providers: [HnLikeAggregateService],
  exports: [HnLikeAggregateService],
})
export class HnLikeAggregateModule {}
