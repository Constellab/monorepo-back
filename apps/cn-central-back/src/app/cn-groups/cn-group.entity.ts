import {
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  TableInheritance
} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {CnGroupType} from './cn-group-type.enum';
import {CnUser} from '../cn-users/cn-user.entity';
import {Exclude} from 'class-transformer';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnOrganization} from '../cn-organizations/cn-organization.entity';

@TableInheritance({column: {type: 'enum', enum: CnGroupType, name: 'type'}})
@Entity('group')
export class CnGroup extends CnBaseEntity {

  @Column({nullable: false})
  label: string;

  @Column({type: 'enum', enum: CnGroupType, nullable: false, default: CnGroupType.SINGLE_USER})
  type: CnGroupType;
}

@ChildEntity(CnGroupType.SINGLE_USER)
export class CnGroupSingleUser extends CnGroup {

  @Exclude()
  @OneToOne(() => CnUser, (user: CnUser) => user.ownGroup, {lazy: true})
  @JoinColumn()
  user: CnUser;

  @Column({update: false})
  userId: string;

  type: CnGroupType.SINGLE_USER;

  // don't set the createdBy and lastModifiedBy automatically
  // because this group is created on user signup (so no current user)
  setCreatedInfo(): void {
  }

  setLastModifiedInfo(): void {
  }
}

@ChildEntity(CnGroupType.TEAM)
export class CnGroupTeam extends CnGroup {

  @OneToMany(() => CnUserGroup, userGroup => userGroup.group)
  users: CnUserGroup[];

  type: CnGroupType.TEAM;

  @Exclude()
  @BlNotUpdatable()
  @ManyToOne(() => CnOrganization, {nullable: true})
  organization?: CnOrganization;

  @Column({nullable: true, update: false})
  organizationId: string;
}

@Entity('user_group')
export class CnUserGroup {

  @PrimaryColumn({type: 'varchar', length: 36})
  userId: string;

  @ManyToOne(() => CnUser, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  user: CnUser;

  @PrimaryColumn({type: 'varchar', length: 36})
  groupId: string;

  @ManyToOne(() => CnGroupTeam, group => group.users,
    {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  group: CnGroupTeam;
}
