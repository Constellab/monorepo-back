import {BeforeInsert, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation} from 'typeorm';
import {BlLuxonDateTimeColumn, BlNotUpdatable} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {Type} from 'class-transformer';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnProject} from '../../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {ClDateHelper} from '@monorepo/core-lib';

/**
 * Entity for N to N relation between lab instance and project shared to lab
 */
@Entity('lab_instance_project')
export class CnLabInstanceProject {

  @PrimaryColumn()
  labInstanceId?: string;

  @JoinColumn({name: 'labInstanceId'})
  @ManyToOne(() => CnLabInstance,
    labInstance => labInstance.sharedGroups, {onDelete: 'CASCADE'})
  labInstance: CnLabInstance;

  @PrimaryColumn()
  projectId: string;

  @JoinColumn({name: 'projectId'})
  @ManyToOne(() => CnProject)
  project: CnProject;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  @BlNotUpdatable()
  createdBy: Relation<CnUser>;

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

}
