import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { CnLabEntity } from '../cn-lab.entity';
import { ClDateHelper } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';

export enum CnLabUserRole {
  OWNER = 'OWNER',
  USER = 'USER',
}

/**
 * Entity for N to N relation between lab and group
 */
@Entity('lab_user')
export class CnLabUser {
  @PrimaryColumn()
  labId: string;

  @JoinColumn({ name: 'labId' })
  @ManyToOne(() => CnLabEntity, (lab) => lab.sharedGroups, { onDelete: 'CASCADE' })
  lab: CnLabEntity;

  @PrimaryColumn()
  userId: string;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => CnUserEntity)
  user: CnUser;

  @Column({
    type: 'enum',
    enum: CnLabUserRole,
    nullable: false,
    default: CnLabUserRole.USER,
  })
  role: CnLabUserRole;

  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  @BlNotUpdatable()
  createdBy: Relation<CnUser>;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true })
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
