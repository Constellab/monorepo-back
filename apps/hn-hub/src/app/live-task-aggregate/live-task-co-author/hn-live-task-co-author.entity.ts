import {Entity, ManyToOne} from 'typeorm';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnUser} from '../../users/hn-user.entity';
import {HnLiveTask} from '../live-task/hn-live-task.entity';

@Entity('LiveTaskCoAuthor')
export class HnLiveTaskCoAuthor extends BlEntityWithId {

  @ManyToOne(() => HnLiveTask, liveTask => liveTask.liveTaskCoAuthors)
  liveTask: HnLiveTask;

  @ManyToOne(() => HnUser, user => user.liveTaskCoAuthors, {eager: true})
  user: HnUser;

  initCoAuthor(liveTask: HnLiveTask, user: HnUser): void {
    this.liveTask = liveTask;
    this.user = user;
  }
}
