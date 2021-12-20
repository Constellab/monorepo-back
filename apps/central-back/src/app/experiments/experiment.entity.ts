import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {LabInstance} from '../lab-instances/lab-instance.entity';
import {EntityWithStatus} from '../core/model/entities/entity-with-status.entity';
import {ExperimentStatusHistory} from './experiment-status-history.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {Project} from '../projects/project.entity';

/**
 * An experiment is executed in a lab to produce reports
 *
 * It is defined as a succession of jobs
 */
@Entity()
export class Experiment extends EntityWithStatus<ExperimentStatusHistory> {

  @Column({nullable: false, length: 50})
  label: string;

  @Column({type: 'text', nullable: true})
  description: string;

  @Type(() => ExperimentStatusHistory)
  @OneToOne(() => ExperimentStatusHistory, {nullable: true, eager: true})
  @JoinColumn()
  currentStatus: ExperimentStatusHistory;

  @BlNotUpdatable()
  @Type(() => LabInstance)
  @ManyToOne(() => LabInstance, {nullable: false, eager: true})
  labInstance: LabInstance;

  @BlNotUpdatable()
  @Type(() => Project)
  @ManyToOne(() => Project, {nullable: false})
  project: Project;

}
