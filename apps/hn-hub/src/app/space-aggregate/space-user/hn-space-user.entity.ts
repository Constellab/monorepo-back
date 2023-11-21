import {Column, Entity, ManyToOne, PrimaryColumn, Relation} from 'typeorm';
import {BlLuxonDateTimeColumn, BlNotUpdatable} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {Type} from 'class-transformer';
import {HnUser} from '../../users/hn-user.entity';
import {HnSpace} from '../space/hn-space.entity';

export enum HnSpaceUserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}


@Entity('SpaceUser')
export class HnSpaceUser {

  @PrimaryColumn({type: 'varchar', length: 36})
  userId: string;

  @ManyToOne(() => HnUser, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  user: HnUser;

  @PrimaryColumn({type: 'varchar', length: 36})
  spaceId: string;

  @ManyToOne(() => HnSpace, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  space: HnSpace;

  @Column({
    type: 'enum', enum: HnSpaceUserRole, nullable: false,
    default: HnSpaceUserRole.USER
  })
  role: HnSpaceUserRole;

  @Column({default: true})
  active: boolean;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, {eager: true, nullable: false})
  @BlNotUpdatable()
  addedBy: Relation<HnUser>;

  isSpaceAdmin(): boolean {
    return this.role === HnSpaceUserRole.ADMIN;
  }
}
