import {HnAbstractLikeEntity} from '../like-core/hn-abstract-like.entity';
import {Type} from 'class-transformer';
import {Entity, ManyToOne} from 'typeorm';
import {HnLiveTask} from '../../live-task-aggregate/live-task/hn-live-task.entity';

@Entity('like_live_task')
export class HnLikeLiveTask extends HnAbstractLikeEntity<HnLiveTask> {
  @Type(() => HnLiveTask)
  @ManyToOne(() => HnLiveTask, {eager: true})
  entity: HnLiveTask;
}
