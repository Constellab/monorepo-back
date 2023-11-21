import {Column, Entity} from 'typeorm';
import {HnBaseEntity} from '../../core/model/entities/hn-base.entity';

export enum HnLiveTaskType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  SPACE = 'SPACE'
}

@Entity('LiveTask')
export class HnLiveTask extends HnBaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({type: 'enum', enum: HnLiveTaskType, default: HnLiveTaskType.PUBLIC})
  type: HnLiveTaskType;
}
