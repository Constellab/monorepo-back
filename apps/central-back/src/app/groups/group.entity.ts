import {ChildEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, TableInheritance} from 'typeorm';
import {BaseEntity} from '../core/model/entities/base.entity';
import {GroupType} from './group-type.enum';
import {Organization} from '../organizations/organization.entity';
import {User} from '../users/user.entity';
import {Exclude} from 'class-transformer';

@TableInheritance({column: {type: 'enum', enum: GroupType, name: 'type'}})
@Entity()
export class Group extends BaseEntity {

  @Column({nullable: false})
  label: string;

  @Column({type: 'enum', enum: GroupType, nullable: false, default: GroupType.SINGLE_USER})
  type: GroupType;
}


@ChildEntity(GroupType.ORGANIZATION)
export class GroupOrganization extends Group {

  @OneToOne(() => Organization)
  @JoinColumn()
  organization: Organization;

  type: GroupType.ORGANIZATION;
}

@ChildEntity(GroupType.SINGLE_USER)
export class GroupSingleUser extends Group {

  @Exclude()
  @OneToOne(() => User, (user: User) => user.ownGroup, {lazy: true})
  @JoinColumn()
  user: User;

  type: GroupType.SINGLE_USER;

  // don't set the createdBy and lastModifiedBy automatically
  // because this group is created on user signup (so no current user)
  setCreatedByUser(): void {
  }

  setLastModifiedByUser(): void {
  }
}

@ChildEntity(GroupType.USERS)
export class GroupUsers extends Group {

  @ManyToMany(() => User, (user: User) => user.groups)
  @JoinTable({name: 'user_group'})
  users: User[];

  type: GroupType.USERS;
}
