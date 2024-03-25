import {Injectable} from '@nestjs/common';
import {HnLikeStoryService} from './like-story/hn-like-story.service';
import {HnStory} from '../story/hn-story.entity';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';

@Injectable()
export class HnLikeAggregateService {
  constructor(private readonly likeStoryService: HnLikeStoryService) {
  }

  ///////////////////////// LIKE STORY /////////////////////////////
  async checkIfStoryIsLiked(storyId: string): Promise<boolean> {
    if (HnCurrentUserHelper.getCurrentUser() == null) {
      return false;
    }
    return this.likeStoryService.checkIfLiked(storyId);
  }

  async likeStory(storyId: string): Promise<HnStory> {
    return this.likeStoryService.like(storyId);
  }

  async unlikeStory(storyId: string): Promise<HnStory> {
    return this.likeStoryService.unlike(storyId);
  }
}
