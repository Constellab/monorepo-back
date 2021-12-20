import {ChildEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, TableInheritance} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {CnGroupType} from './cn-group-type.enum';
import {CnOrganization} from '../cn-organizations/cn-organization.entity';
import {CnUser} from '../cn-users/cn-user.entity';
import {Exclude} from 'class-transformer';

@TableInheritance({column: {type: 'enum', enum: CnGroupType, name: 'type'}})
@Entity('group')
export class CnGroup extends CnBaseEntity {

  @Column({nullable: false})
  label: string;

  @Column({type: 'enum', enum: CnGroupType, nullable: false, default: CnGroupType.SINGLE_USER})
  type: CnGroupType;
}


@ChildEntity(CnGroupType.ORGANIZATION)
export class CnGroupOrganization extends CnGroup {

  @OneToOne(() => CnOrganization)
  @JoinColumn()
  organization: CnOrganization;

  type: CnGroupType.ORGANIZATION;
}

@ChildEntity(CnGroupType.SINGLE_USER)
export class CnGroupSingleUser extends CnGroup {

  @Exclude()
  @OneToOne(() => CnUser, (user: CnUser) => user.ownGroup, {lazy: true})
  @JoinColumn()
  user: CnUser;

  type: CnGroupType.SINGLE_USER;

  // don't set the createdBy and lastModifiedBy automatically
  // because this group is created on user signup (so no current user)
  setCreatedByUser(): void {
  }

  setLastModifiedByUser(): void {
  }
}

@ChildEntity(CnGroupType.USERS)
export class CnGroupUsers extends CnGroup {

  @ManyToMany(() => CnUser, (user: CnUser) => user.groups)
  @JoinTable({name: 'user_group'})
  users: CnUser[];

  type: CnGroupType.USERS;
}
