import {BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation} from 'typeorm';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnGroup} from '../cn-groups/cn-group.entity';
import {ClDateHelper} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {Type} from 'class-transformer';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {BlLuxonDateTimeColumn, BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnUser} from '../cn-users/cn-user.entity';


export enum CnLabInstanceGroupRole {
  OWNER = 'OWNER',
  USER = 'USER'
}

/**
 * Entity for N to N relation between lab instance and group
 */
@Entity('lab_instance_group')
export class CnLabInstanceGroup {

  @PrimaryColumn()
  labInstanceId?: string;

  @JoinColumn({name: 'labInstanceId'})
  @ManyToOne(() => CnLabInstance,
    labInstance => labInstance.sharedGroups, {onDelete: 'CASCADE'})
  labInstance: CnLabInstance;

  @PrimaryColumn()
  groupId?: string;

  @JoinColumn({name: 'groupId'})
  @ManyToOne(() => CnGroup)
  group: CnGroup;

  @Column({
    type: 'enum', enum: CnLabInstanceGroupRole, nullable: false,
    default: CnLabInstanceGroupRole.USER
  })
  role: CnLabInstanceGroupRole;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  @BlNotUpdatable()
  createdBy: Relation<CnUser>;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true})
  lastModifiedBy: Relation<CnUser>;

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}
