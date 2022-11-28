import {BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation} from 'typeorm';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {ClDateHelper} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {Type} from 'class-transformer';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {BlLuxonDateTimeColumn, BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnUser} from '../../cn-users/cn-user.entity';


export enum CnLabInstanceUserRole {
  OWNER = 'OWNER',
  USER = 'USER'
}

/**
 * Entity for N to N relation between lab instance and group
 */
@Entity('lab_instance_user')
export class CnLabInstanceUser {

  @PrimaryColumn()
  labInstanceId: string;

  @JoinColumn({name: 'labInstanceId'})
  @ManyToOne(() => CnLabInstance,
    labInstance => labInstance.sharedGroups, {onDelete: 'CASCADE'})
  labInstance: CnLabInstance;

  @PrimaryColumn()
  userId: string;

  @JoinColumn({name: 'userId'})
  @ManyToOne(() => CnUser)
  user: CnUser;

  @Column({
    type: 'enum', enum: CnLabInstanceUserRole, nullable: false,
    default: CnLabInstanceUserRole.USER
  })
  role: CnLabInstanceUserRole;

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
