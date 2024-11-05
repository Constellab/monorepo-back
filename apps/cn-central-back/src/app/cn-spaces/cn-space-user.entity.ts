import { BeforeInsert, Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';
import { CnUser, CnUserEntity } from '../cn-users/cn-user.entity';
import { CnSpace } from './cn-space.entity';
import { Type } from 'class-transformer';
import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { ClDateHelper } from '@monorepo/core-lib';

export enum CnSpaceUserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('space_user')
export class CnSpaceUser {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => CnUserEntity, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  user: CnUser;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  spaceId: string;

  @ManyToOne(() => CnSpace, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  space: CnSpace;

  @Column({
    type: 'enum',
    enum: CnSpaceUserRole,
    nullable: false,
    default: CnSpaceUserRole.USER,
  })
  role: CnSpaceUserRole;

  @Column({ default: true })
  active: boolean;

  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  @BlNotUpdatable()
  addedBy: Relation<CnUser>;

  isSpaceAdmin(): boolean {
    return this.role === CnSpaceUserRole.ADMIN;
  }

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdAt = ClDateHelper.getDate();
  }
}
