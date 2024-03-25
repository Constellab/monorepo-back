import {Controller, Get, Param, Post} from '@nestjs/common';
import {HnLikeAggregateService} from './hn-like-aggregate.service';
import {HnStory} from '../story/hn-story.entity';
import {BlPublic} from '@monorepo/back-core-lib';

@Controller('like-story')
export class HnLikeStoryController {
  constructor(private readonly likeAggregateService: HnLikeAggregateService) {
  }

  @BlPublic()
  @Get(':storyId')
  async checkIfLiked(@Param('storyId') storyId: string): Promise<boolean> {
    return this.likeAggregateService.checkIfStoryIsLiked(storyId);
  }

  @Post(':storyId/like')
  async likeStory(@Param('storyId') storyId: string): Promise<HnStory> {
    return this.likeAggregateService.likeStory(storyId);
  }

  @Post(':storyId/unlike')
  async unlikeStory(@Param('storyId') storyId: string): Promise<HnStory> {
    return this.likeAggregateService.unlikeStory(storyId);
  }

}
