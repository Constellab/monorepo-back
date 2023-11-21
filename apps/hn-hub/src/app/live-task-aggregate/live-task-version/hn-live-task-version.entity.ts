import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {BlEntityWithId, BlNotUpdatable} from '@monorepo/back-core-lib';
import {HnLiveTask} from '../live-task/hn-live-task.entity';

export enum HnLiveTaskVersionState {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT'
}

@Unique(['version', 'liveTask'])
@Entity('LiveTaskVersion')
export class HnLiveTaskVersion extends BlEntityWithId {

  @Column({default: 1})
  version: number;

  @BlNotUpdatable()
  @ManyToOne(() => HnLiveTask, {eager: true, onDelete: "CASCADE"})
  liveTask: HnLiveTask;

  @Column({type: 'enum', enum: HnLiveTaskVersionState, nullable: false, default: HnLiveTaskVersionState.DRAFT})
  versionState: HnLiveTaskVersionState;

  @Column({type: 'text', nullable: false})
  code: string;
}
