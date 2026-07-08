import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Exclude, Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { Column, Entity, ManyToOne } from 'typeorm';

import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { CnLabEntity } from '../cn-lab.entity';

/**
 * Entity to store the free lab info for a lab for a user
 */
@Entity('lab_free')
export class CnLabFree extends CnBaseEntity {
  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  @BlNotUpdatable()
  @Exclude()
  user!: CnUser;

  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @BlNotUpdatable()
  @Exclude()
  lab?: CnLabEntity;

  @Column({ nullable: true, length: 36 })
  labId?: string;

  // the number of hours the user can use the lab per month
  @Column({ nullable: false })
  usageLimitInHours!: number;

  @BlLuxonDateTimeColumn({ nullable: true })
  expirationDate?: DateTime | null;

  isExpired(): boolean {
    if (!this.expirationDate) return false;
    return this.expirationDate < ClDateHelper.getDate();
  }

  getDeletionDate(deletionAfterDays: number): DateTime | null {
    if (!this.expirationDate) return null;
    return this.expirationDate.plus({ days: deletionAfterDays });
  }

  toDelete(deletionAfterDays: number): boolean {
    const deletionDate = this.getDeletionDate(deletionAfterDays);
    if (!deletionDate) return false;
    return deletionDate < ClDateHelper.getDate();
  }
}
