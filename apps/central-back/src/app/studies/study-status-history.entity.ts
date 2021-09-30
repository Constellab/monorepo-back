import {Column, Entity, ManyToOne} from 'typeorm';
import {StatusHistory} from '../core/model/entities/status-history.entity';
import {StudyStatus} from './study-status.enum';
import {Exclude, Type} from 'class-transformer';
import {Study} from './study.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Entity()
export class StudyStatusHistory extends StatusHistory<StudyStatus> {

  @Column({type: 'enum', enum: StudyStatus, nullable: false, default: StudyStatus.STARTED})
  status: StudyStatus;

  @Exclude()
  @BlNotUpdatable()
  @Type(() => Study)
  @ManyToOne(() => Study, {nullable: false})
  entity: Study;
}
