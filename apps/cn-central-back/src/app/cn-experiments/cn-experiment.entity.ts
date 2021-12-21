import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {CnLabInstance} from '../cn-lab-instances/cn-lab-instance.entity';
import {CnEntityWithStatus} from '../cn-core/model/entities/cn-entity-with-status.entity';
import {CnExperimentStatusHistory} from './cn-experiment-status-history.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnProject} from '../cn-projects/cn-project.entity';

/**
 * An experiment is executed in a lab to produce reports
 *
 * It is defined as a succession of jobs
 */
@Entity('experiment')
export class CnExperiment extends CnEntityWithStatus<CnExperimentStatusHistory> {

  @Column({nullable: false, length: 50})
  title: string;

  @Column({type: 'text', nullable: true})
  description: string;

  @Type(() => CnExperimentStatusHistory)
  @OneToOne(() => CnExperimentStatusHistory, {nullable: true, eager: true})
  @JoinColumn()
  currentStatus: CnExperimentStatusHistory;

  @BlNotUpdatable()
  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, {nullable: false, eager: true})
  labInstance: CnLabInstance;

  @BlNotUpdatable()
  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {nullable: false})
  project: Promise<CnProject>;

  @Column()
  projectId: string;

}
