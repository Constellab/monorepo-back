import {HnAbstractCommentEntity} from '../comment-core/hn-abstract-comment.entity';
import {Type} from 'class-transformer';
import {Entity, ManyToOne} from 'typeorm';
import {HnLiveTask} from '../../live-task-aggregate/live-task/hn-live-task.entity';

@Entity('comment_live_task')
export class HnCommentLiveTask extends HnAbstractCommentEntity<HnLiveTask> {
  @Type(() => HnLiveTask)
  @ManyToOne(() => HnLiveTask, {eager: true, onDelete: 'CASCADE'})
  entity: HnLiveTask;
}
