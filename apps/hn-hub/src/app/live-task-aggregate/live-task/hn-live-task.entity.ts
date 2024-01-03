import {Column, Entity, ManyToOne} from 'typeorm';
import {HnBaseEntity} from '../../core/model/entities/hn-base.entity';
import {HnCreateLiveTaskDto} from './hn-live-task.dto';
import {HnSpace} from '../../space-aggregate/space/hn-space.entity';

@Entity('LiveTask')
export class HnLiveTask extends HnBaseEntity {
  @Column()
  title: string;

  @Column({name: 'description', type: 'simple-json', nullable: true})
  description?: Record<string, any>;

  @Column({name: 'latest_publish_version', nullable: true})
  latestPublishVersion?: number;

  @ManyToOne(() => HnSpace, {eager: true})
  space?: HnSpace;

  isPublic(): boolean {
    return this.space == null;
  }

  static init(liveTaskDto: HnCreateLiveTaskDto): HnLiveTask {
    const liveTask = new HnLiveTask();
    liveTask.title = liveTaskDto.title;
    liveTask.space = liveTaskDto.space;
    return liveTask;
  }
}
