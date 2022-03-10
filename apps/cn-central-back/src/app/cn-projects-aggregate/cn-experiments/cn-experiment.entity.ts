import {Column, Entity, ManyToMany, ManyToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {CnLabInstance} from '../../cn-lab-instances/cn-lab-instance.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnReport} from '../cn-reports/cn-report.entity';
import {CnExperimentStatus} from './cn-experiment-status.enum';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {CnLabConfig} from '../../cn-lab-configs/cn-lab-config.entity';
import {CmRichTextI} from '@monorepo/common-model';

export interface CnExperimentProtocol {
  version: number;
  data: any;
}


/**
 * An experiment is executed in a lab to produce reports
 *
 * It is defined as a succession of jobs
 */
@Entity('experiment')
export class CnExperiment extends CnBaseEntity {

  @Column({nullable: false, length: 50})
  title: string;

  @Column({type: 'simple-json', array: false, nullable: true})
  description: CmRichTextI;

  @Column({type: 'enum', enum: CnExperimentStatus, nullable: false})
  status: CnExperimentStatus;

  @BlNotUpdatable()
  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, {nullable: false, eager: true})
  labInstance: CnLabInstance;

  @BlNotUpdatable()
  @Type(() => CnLabConfig)
  @ManyToOne(() => CnLabConfig, {nullable: false})
  labConfig: CnLabConfig;

  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {nullable: false})
  project: CnProject;

  @Column()
  projectId: string;

  @ManyToMany(() => CnReport, report => report.experiments)
  reports: CnReport[];

  @Column({ type: 'simple-json', nullable: false})
  protocol: CnExperimentProtocol;

}
