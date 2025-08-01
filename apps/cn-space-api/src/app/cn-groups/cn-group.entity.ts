import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Exclude, Type } from 'class-transformer';
import { DateTime } from 'luxon';
import {
  BeforeInsert,
  BeforeUpdate,
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Relation,
  TableInheritance,
} from 'typeorm';

import { CnBaseEntity } from '../cn-core/model/entities/cn-base.entity';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnSpace, CnSpaceEntity } from '../cn-spaces/cn-space.entity';
import { CnUser, CnUserEntity } from '../cn-users/cn-user.entity';
import { CnGroupType } from './cn-group-type.enum';

@TableInheritance({ column: { type: 'enum', enum: CnGroupType, name: 'type' } })
@Entity('group')
export class CnGroup extends CnBaseEntity {
  @Column({ nullable: false })
  label: string;

  @Column({ type: 'enum', enum: CnGroupType, nullable: false, default: CnGroupType.SINGLE_USER })
  type: CnGroupType;
}

@ChildEntity(CnGroupType.SINGLE_USER)
export class CnGroupSingleUser extends CnGroup {
  @OneToOne(() => CnUserEntity, (user: CnUserEntity) => user.ownGroup, { eager: true })
  @JoinColumn()
  user: CnUser;

  @Column({ update: false })
  userId: string;

  type: CnGroupType.SINGLE_USER;

  // don't set the createdBy and lastModifiedBy automatically
  // because this group is created on user signup (so no current user)
  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}

@ChildEntity(CnGroupType.TEAM)
export class CnGroupTeam extends CnGroup {
  @OneToMany(() => CnUserGroup, (userGroup) => userGroup.group)
  users: CnUserGroup[];

  type: CnGroupType.TEAM;

  @Exclude()
  @BlNotUpdatable()
  @ManyToOne(() => CnSpaceEntity, { nullable: true })
  space?: CnSpace;

  @Column({ nullable: true, update: false })
  spaceId: string;
}

@Entity('user_group')
export class CnUserGroup {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => CnUserEntity, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  user: CnUser;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  groupId: string;

  @ManyToOne(() => CnGroupTeam, (group) => group.users, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  group: CnGroupTeam;

  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  @BlNotUpdatable()
  createdBy: Relation<CnUser>;

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }
}
