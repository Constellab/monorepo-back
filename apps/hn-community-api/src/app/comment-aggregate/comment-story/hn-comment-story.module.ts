import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnStoryModule } from '../../story/hn-story.module';
import { HnCommentStory } from './hn-comment-story.entity';
import { HnCommentStoryService } from './hn-comment-story.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommentStory]), HnStoryModule],
  providers: [HnCommentStoryService],
  exports: [TypeOrmModule, HnCommentStoryService],
})
export class HnCommentStoryModule {}
