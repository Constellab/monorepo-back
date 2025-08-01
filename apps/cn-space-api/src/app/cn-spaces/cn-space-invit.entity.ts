import { BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { ClDateHelper, ClStringHelper } from '@monorepo/core-lib';
import { Exclude } from 'class-transformer';
import { DateTime } from 'luxon';
import { BeforeInsert, Column, Entity, ManyToOne, Unique } from 'typeorm';

import { CnBaseEntity } from '../cn-core/model/entities/cn-base.entity';
import { CnSpace, CnSpaceEntity } from './cn-space.entity';
import { CnSpaceUserRole } from './cn-space-user.entity';

@Unique(['spaceId', 'userMail'])
@Entity('space_invit')
export class CnSpaceInvit extends CnBaseEntity {
  @Column({ type: 'varchar', length: 36 })
  spaceId: string;

  @ManyToOne(() => CnSpaceEntity, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  space: CnSpace;

  @Column({
    type: 'enum',
    enum: CnSpaceUserRole,
    nullable: false,
    default: CnSpaceUserRole.USER,
  })
  role: CnSpaceUserRole;

  @Column({ nullable: false })
  userMail: string;

  @BlLuxonDateTimeColumn({ nullable: false })
  validUntil: DateTime;

  @Exclude()
  @Column({ type: 'varchar', length: 60, nullable: false, update: false })
  code: string;

  isValid(): boolean {
    return this.validUntil > ClDateHelper.getDate();
  }

  @BeforeInsert()
  private generateCode(): void {
    this.code = ClStringHelper.generateUUID() + '_' + new Date().getTime();
  }
}
