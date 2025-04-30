import { Module } from '@nestjs/common';
import { HnLikeStoryService } from './hn-like-story.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnLikeStory } from './hn-like-story.entity';
import { HnStoryModule } from '../../story/hn-story.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnLikeStory]), HnStoryModule],
  providers: [HnLikeStoryService],
  exports: [TypeOrmModule, HnLikeStoryService],
})
export class HnLikeStoryModule {}
