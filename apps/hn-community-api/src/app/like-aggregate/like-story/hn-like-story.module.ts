import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnStoryModule } from '../../story/hn-story.module';
import { HnLikeStory } from './hn-like-story.entity';
import { HnLikeStoryService } from './hn-like-story.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnLikeStory]), HnStoryModule],
  providers: [HnLikeStoryService],
  exports: [TypeOrmModule, HnLikeStoryService],
})
export class HnLikeStoryModule {}
