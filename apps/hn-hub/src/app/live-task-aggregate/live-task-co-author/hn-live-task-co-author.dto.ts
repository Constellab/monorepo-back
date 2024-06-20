import {HnLiveTaskDto} from '../live-task/hn-live-task.dto';
import {HnUserDto} from '../../users/hn-user.dto';
import {HnLiveTaskCoAuthor} from './hn-live-task-co-author.entity';

export class HnLiveTaskCoAuthorDto{
  id: string;
  liveTask: HnLiveTaskDto;
  user: HnUserDto;

  constructor(liveTaskCoAuthor: HnLiveTaskCoAuthor) {
    this.id = liveTaskCoAuthor.id;
    this.liveTask = new HnLiveTaskDto(liveTaskCoAuthor.liveTask);
    this.user = new HnUserDto(liveTaskCoAuthor.user);
  }
}
