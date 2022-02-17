import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {Column, Entity, JoinTable, ManyToMany, ManyToOne} from 'typeorm';
import {CnExperiment} from '../cn-experiments/cn-experiment.entity';
import {Type} from 'class-transformer';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CmRichTextI} from '@monorepo/common-model';

@Entity('report')
export class CnReport extends CnBaseEntity {

  @Column()
  title: string;

  @Column({type: 'simple-json', nullable: true})
  content: CmRichTextI;

  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {nullable: false})
  project: CnProject;

  @Column()
  projectId: string;

  @ManyToMany(() => CnExperiment, experiment => experiment.reports)
  @JoinTable({name: 'report_experiment'})
  experiments: CnExperiment[];
}
