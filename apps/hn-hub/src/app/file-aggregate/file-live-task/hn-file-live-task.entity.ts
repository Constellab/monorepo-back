import {Entity, ManyToOne} from 'typeorm';
import {HnAbstractFileEntity} from '../file-core/hn-abstract-file.entity';
import {HnLiveTask} from '../../live-task-aggregate/live-task/hn-live-task.entity';

@Entity('file_live_task')
export class HnFileLiveTask extends HnAbstractFileEntity<HnLiveTask> {

  @ManyToOne(() => HnLiveTask, doc => doc.liveTaskFiles, {nullable: false, onDelete: 'CASCADE'})
  entity: HnLiveTask;

}
