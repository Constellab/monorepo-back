import {Entity, ManyToOne, PrimaryColumn} from 'typeorm';
import {HnUser} from '../../users/hn-user.entity';
import {HnSpace} from '../space/hn-space.entity';
import {HnLiveTask} from '../../live-task-aggregate/live-task/hn-live-task.entity';

@Entity('SpaceLiveTask')
export class HnSpaceLiveTask {

  @PrimaryColumn({type: 'varchar', length: 36})
  liveTaskId: string;

  @ManyToOne(() => HnUser, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  liveTask: HnLiveTask;

  @PrimaryColumn({type: 'varchar', length: 36})
  spaceId: string;

  @ManyToOne(() => HnSpace, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  space: HnSpace;

}
