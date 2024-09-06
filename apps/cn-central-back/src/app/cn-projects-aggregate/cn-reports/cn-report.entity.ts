import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { CnExperiment } from '../cn-experiments/cn-experiment.entity';
import { Exclude, Type } from 'class-transformer';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { BlLuxonDateTimeColumn, BlNotUpdatable, BlRichTextContent } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { CnLabInstance } from '../../cn-lab-instances/cn-lab-instance.entity';
import { CnProjectDocument } from '../cn-project-documents/cn-project-document.entity';
import { CnFolderObject } from '../cn-folder-hierarchies/cn-folder-object.entity';
import { CnFolderHierarchyInfo } from '../cn-folder-hierarchies/cn-folder-hierarchy.dto';

@Entity('report')
export class CnReport extends CnFolderObject {

  @Column()
  title: string;

  @Exclude()
  @Column({ type: 'simple-json', nullable: true })
  content: BlRichTextContent;

  @ManyToMany(() => CnExperiment, experiment => experiment.reports)
  @JoinTable({ name: 'report_experiment' })
  experiments: CnExperiment[];

  @BlNotUpdatable()
  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, { nullable: false })
  labInstance: CnLabInstance;

  @Type(() => CnLabConfig)
  @ManyToOne(() => CnLabConfig, { nullable: false })
  labConfig: CnLabConfig;

  @Column({ nullable: false, default: false })
  isValidated: boolean;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, { eager: true, nullable: true })
  validatedBy: CnUser;

  @BlLuxonDateTimeColumn({ nullable: true })
  validatedAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, { eager: true, nullable: false })
  lastSyncBy: CnUser;

  @BlLuxonDateTimeColumn({ nullable: false })
  lastSyncAt: DateTime;

  @Type(() => CnProjectDocument)
  @ManyToOne(() => CnProjectDocument, { nullable: true })
  document?: CnProjectDocument;

  getFolderObjectInfo(): CnFolderHierarchyInfo {
    return {
      name: this.title,
      user: this.lastModifiedBy,
      lastModifiedAt: this.lastModifiedAt,
      isValidated: this.isValidated,
    };
  }


}
