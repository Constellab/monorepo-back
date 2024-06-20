import {HnUserDto} from '../users/hn-user.dto';
import {HnStoryCoAuthor} from './hn-story-author.entity';
import {HnStoryDto} from '../story/hn-story.dto';

export class HnStoryCoAuthorDto {
  story: HnStoryDto;
  user: HnUserDto;

  constructor(storyCoAuthor: HnStoryCoAuthor) {
    this.story = new HnStoryDto(storyCoAuthor.story);
    this.user = new HnUserDto(storyCoAuthor.user);
  }
}
