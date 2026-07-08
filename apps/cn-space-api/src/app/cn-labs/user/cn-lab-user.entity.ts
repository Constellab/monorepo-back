import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
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

import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { CnLabEntity } from '../cn-lab.entity';

export enum CnLabUserRole {
  OWNER = 'OWNER',
  USER = 'USER',
}

/**
 * Entity for N to N relation between lab and group
 */
@Entity('lab_user')
export class CnLabUserEntity {
  @PrimaryColumn({ length: 36 })
  labId!: string;

  @JoinColumn()
  @ManyToOne(() => CnLabEntity, (lab) => lab.sharedGroups, { onDelete: 'CASCADE', nullable: false })
  lab!: CnLabEntity;

  @PrimaryColumn({ length: 36 })
  userId!: string;

  @JoinColumn()
  @ManyToOne(() => CnUserEntity, { nullable: false })
  user!: CnUser;

  @Column({
    type: 'enum',
    enum: CnLabUserRole,
    nullable: false,
    default: CnLabUserRole.USER,
  })
  role!: CnLabUserRole;

  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt!: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  @BlNotUpdatable()
  createdBy!: Relation<CnUser>;

  @BlLuxonDateTimeColumn()
  lastModifiedAt!: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  lastModifiedBy!: Relation<CnUser>;

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

export type CnLabUser = Omit<CnLabUserEntity, 'lab' | 'user'>;

export type CnLabUserWithUser = Omit<CnLabUserEntity, 'lab'>;
