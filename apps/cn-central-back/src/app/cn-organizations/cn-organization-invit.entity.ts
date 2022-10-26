import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {BeforeInsert, Column, Entity, ManyToOne, Unique} from 'typeorm';
import {CnOrganization} from './cn-organization.entity';
import {CnOrganizationUserRole} from './cn-organization-user.entity';
import {BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {ClDateHelper, ClStringHelper} from '@monorepo/core-lib';
import {Exclude} from 'class-transformer';

@Unique(['organizationId', 'userMail'])
@Entity('organisation_invit')
export class CnOrganizationInvit extends CnBaseEntity {

  @Column({type: 'varchar', length: 36})
  organizationId: string;

  @ManyToOne(() => CnOrganization,
    {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  organization: CnOrganization;

  @Column({
    type: 'enum', enum: CnOrganizationUserRole, nullable: false,
    default: CnOrganizationUserRole.USER
  })
  role: CnOrganizationUserRole;

  @Column({nullable: false})
  userMail: string;

  @BlLuxonDateTimeColumn({nullable: false})
  validUntil: DateTime;

  @Exclude()
  @Column({type: 'varchar', length: 60, nullable: false, update: false})
  code: string;

  isValid(): boolean {
    return this.validUntil > ClDateHelper.getDate();
  }

  @BeforeInsert()
  private generateCode(): void {
    this.code = ClStringHelper.generateUUID() + '_' + new Date().getTime();
  }

}
