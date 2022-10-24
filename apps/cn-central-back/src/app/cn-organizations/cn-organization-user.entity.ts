import {Column, Entity, ManyToOne, PrimaryColumn} from 'typeorm';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnOrganization} from './cn-organization.entity';

export enum CnOrganizationUserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}


@Entity('organization_user')
export class CnOrganizationUser {

  @PrimaryColumn({type: 'varchar', length: 36})
  userId: string;

  @ManyToOne(() => CnUser, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  user: CnUser;

  @PrimaryColumn({type: 'varchar', length: 36})
  organizationId: string;

  @ManyToOne(() => CnOrganization,
    {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  organization: CnOrganization;

  @Column({
    type: 'enum', enum: CnOrganizationUserRole, nullable: false,
    default: CnOrganizationUserRole.USER
  })
  role: CnOrganizationUserRole;

  @Column({default: true})
  active: boolean;

  isOrganizationAdmin(): boolean {
    return this.role === CnOrganizationUserRole.ADMIN;
  }
}
