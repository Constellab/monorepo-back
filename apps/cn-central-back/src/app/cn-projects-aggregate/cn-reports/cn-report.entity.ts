import {Column, Entity, JoinTable, ManyToMany, ManyToOne} from 'typeorm';
import {CnExperiment} from '../cn-experiments/cn-experiment.entity';
import {Exclude, Type} from 'class-transformer';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnLabConfig} from '../../cn-lab-configs/cn-lab-config.entity';
import {CnUser} from '../../cn-users/cn-user.entity';
import {BlLuxonDateTimeColumn, BlNotUpdatable, BlRichTextContent} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {CnEntity} from '../../cn-core/model/entities/cn.entity';
import {CnLabInstance} from '../../cn-lab-instances/cn-lab-instance.entity';
import {CnProjectDocument} from '../cn-project-documents/cn-project-document.entity';

@Entity('report')
export class CnReport extends CnEntity {

  @Column()
  title: string;

  @Exclude()
  @Column({type: 'simple-json', nullable: true})
  content: BlRichTextContent;

  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {nullable: false})
  project: CnProject;

  @Column()
  projectId: string;

  @ManyToMany(() => CnExperiment, experiment => experiment.reports)
  @JoinTable({name: 'report_experiment'})
  experiments: CnExperiment[];

  @BlNotUpdatable()
  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, {nullable: false})
  labInstance: CnLabInstance;

  @Type(() => CnLabConfig)
  @ManyToOne(() => CnLabConfig, {nullable: false})
  labConfig: CnLabConfig;

  @Column({nullable: false, default: false})
  isValidated: boolean;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: true})
  validatedBy: CnUser;

  @BlLuxonDateTimeColumn({nullable: true})
  validatedAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  lastSyncBy: CnUser;

  @BlLuxonDateTimeColumn({nullable: false})
  lastSyncAt: DateTime;

  @Type(() => CnProjectDocument)
  @ManyToOne(() => CnProjectDocument, {nullable: true})
  document?: CnProjectDocument;
}
