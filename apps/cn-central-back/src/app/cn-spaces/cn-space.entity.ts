import {BeforeInsert, BeforeUpdate, Column, Entity} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {ClDateHelper, ClStringHelper} from '@monorepo/core-lib';

export enum CnSpaceType {
  // personal space create on the user creation (he cas invite other users in his space)
  PERSONAL = 'PERSONAL',
  // basic space created by a user
  BASIC = 'BASIC',
}


@Entity('space')
export class CnSpace extends CnBaseEntity {

  @Column({nullable: false})
  name: string;

  @Column({nullable: true})
  photo: string;

  // front domain for this space
  @Column({length: 50, unique: true})
  domain: string;

  @Column({default: 0})
  nbLicenses: number;

  @Column({type: 'enum', enum: CnSpaceType, nullable: false, update: false})
  type: CnSpaceType;

  // don't set the createdBy and lastModifiedBy automatically
  // because this group it can be created on user signup (so no current user)
  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdAt = ClDateHelper.getDate();
    this.domain = ClStringHelper.generateUUID();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}
