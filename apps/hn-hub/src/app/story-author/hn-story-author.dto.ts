import {HnUserDto} from '../users/hn-user.dto';
import {HnStoryCoAuthor} from './hn-story-author.entity';

export class HnStoryCoAuthorDto {
  user: HnUserDto;

  constructor(storyCoAuthor: HnStoryCoAuthor) {
    this.user = new HnUserDto(storyCoAuthor.user);
  }
}
