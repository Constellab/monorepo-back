import {BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {HnUser} from '../../users/hn-user.entity';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {ClDateHelper} from '@monorepo/core-lib';

export enum HnSpaceType {
  // personal space create on the user creation (he cas invite other users in his space)
  PERSONAL = 'PERSONAL',
  // basic space created by a user
  BASIC = 'BASIC',
}

@Entity('space')
export class HnSpace extends BlEntityWithId {
  @Column({nullable: false})
  name: string;

  @Column({nullable: true})
  photo: string;

  @Column({length: 50, unique: true})
  domain: string;

  @Column({type: 'enum', enum: HnSpaceType, nullable: false, update: false})
  type: HnSpaceType;

  @BlLuxonDateTimeColumn({nullable: true, update: false})
  createdAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, {eager: true, nullable: true})
  createdBy?: HnUser;

  @BlLuxonDateTimeColumn({nullable: true})
  lastModifiedAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, {eager: true, nullable: true})
  lastModifiedBy: HnUser;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = HnCurrentUserHelper.getCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}
