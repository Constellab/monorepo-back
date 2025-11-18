import { Module } from '@nestjs/common';

import { HnCoreModule } from '../core/hn-core.module';
import { HnLikeController } from './hn-like.controller';
import { HnLikeAggregateService } from './hn-like-aggregate.service';
import { HnLikeAgentModule } from './like-agent/hn-like-agent.module';
import { HnLikeAppModule } from './like-app/hn-like-app.module';
import { HnLikeBrickModule } from './like-brick/hn-like-brick.module';
import { HnLikeStoryModule } from './like-story/hn-like-story.module';
import { HnLikeTagModule } from './like-tag/hn-like-tag.module';
import { HnLikePartnerModule } from './like-partner/hn-like-partner.module';

@Module({
  imports: [
    HnCoreModule,
    HnLikeStoryModule,
    HnLikeAgentModule,
    HnLikeBrickModule,
    HnLikeAppModule,
    HnLikeTagModule,
    HnLikePartnerModule
  ],
  controllers: [HnLikeController],
  providers: [HnLikeAggregateService],
  exports: [HnLikeAggregateService],
})
export class HnLikeAggregateModule {}
