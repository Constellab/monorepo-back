import {Module} from '@nestjs/common';
import {HnCommentStoryService} from './hn-comment-story.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnCommentStory} from './hn-comment-story.entity';
import {HnStoryModule} from '../../story/hn-story.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnCommentStory]),
    HnStoryModule
  ],
  providers: [HnCommentStoryService],
  exports: [TypeOrmModule, HnCommentStoryService]
})
export class HnCommentStoryModule {
}
