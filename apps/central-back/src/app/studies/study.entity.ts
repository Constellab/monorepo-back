import {BaseEntity} from '../core/model/entities/base.entity';
import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {NotUpdatable} from '../core/decorators/not-updatable.decorator';
import {Type} from 'class-transformer';
import {Project} from '../projects/project.entity';
import {StudyStatusHistory} from './study-status-history.entity';

@Entity()
export class Study extends BaseEntity {

  @Column({nullable: false, length: 50})
  title: string;

  @Column({type: 'text', nullable: true})
  description: string;

  @NotUpdatable()
  @Type(() => Project)
  @ManyToOne(() => Project, {nullable: false})
  project: Project;

  @Type(() => StudyStatusHistory)
  @OneToOne(() => StudyStatusHistory, {nullable: true, eager: true})
  @JoinColumn()
  currentStatus: StudyStatusHistory;
}
