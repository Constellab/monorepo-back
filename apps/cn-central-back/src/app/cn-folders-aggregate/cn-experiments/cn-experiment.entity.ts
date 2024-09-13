import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { Exclude, Type } from 'class-transformer';
import { CnLabInstance } from '../../cn-lab-instances/cn-lab-instance.entity';
import { BlLuxonDateTimeColumn, BlNotUpdatable, BlRichTextContent } from '@monorepo/back-core-lib';
import { CnReport } from '../cn-reports/cn-report.entity';
import { CnExperimentStatus } from './cn-experiment-status.enum';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { DateTime } from 'luxon';
import { CnHierarchyRepresentation } from '../cn_hierarchy_objects/cn-hierarchy-representation';
import { CnHierarchyObjectInfo } from '../cn_hierarchy_objects/cn-hierarchy-object.dto';

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
export class CnExperiment extends CnHierarchyRepresentation {

  @Column({ nullable: false, length: 50 })
  title: string;

  @Column({ type: 'simple-json', array: false, nullable: true })
  description: BlRichTextContent;

  @Column({ type: 'enum', enum: CnExperimentStatus, nullable: false })
  status: CnExperimentStatus;

  @BlNotUpdatable()
  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, { nullable: false, eager: true })
  labInstance: CnLabInstance;

  @BlNotUpdatable()
  @Type(() => CnLabConfig)
  @ManyToOne(() => CnLabConfig, { nullable: false })
  labConfig: CnLabConfig;

  @ManyToMany(() => CnReport, report => report.experiments)
  reports: CnReport[];

  @Exclude()
  @Column({ type: 'simple-json', nullable: false })
  protocol: CnExperimentProtocol;

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

  getFolderObjectInfo(): CnHierarchyObjectInfo {
    return {
      name: this.title,
      user: this.lastModifiedBy,
      lastModifiedAt: this.lastModifiedAt,
      isValidated: this.isValidated,
    };
  }
}
