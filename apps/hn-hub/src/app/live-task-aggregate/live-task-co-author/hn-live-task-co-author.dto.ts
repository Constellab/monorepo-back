import {HnUserDto} from '../../users/hn-user.dto';
import {HnLiveTaskCoAuthor} from './hn-live-task-co-author.entity';

export class HnLiveTaskCoAuthorDto{
  id: string;
  user: HnUserDto;

  constructor(liveTaskCoAuthor: HnLiveTaskCoAuthor) {
    this.id = liveTaskCoAuthor.id;
    this.user = new HnUserDto(liveTaskCoAuthor.user);
  }
}
