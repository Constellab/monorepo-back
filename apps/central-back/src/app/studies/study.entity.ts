import {BaseEntity} from '../core/model/entities/base.entity';
import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {Project} from '../projects/project.entity';
import {StudyStatusHistory} from './study-status-history.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Entity()
export class Study extends BaseEntity {

  @Column({nullable: false, length: 50})
  title: string;

  @Column({type: 'text', nullable: true})
  description: string;

  @BlNotUpdatable()
  @Type(() => Project)
  @ManyToOne(() => Project, {nullable: false, eager: true})
  project: Project;

  @Type(() => StudyStatusHistory)
  @OneToOne(() => StudyStatusHistory, {nullable: true, eager: true})
  @JoinColumn()
  currentStatus: StudyStatusHistory;
}
