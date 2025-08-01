import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Exclude, Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { Column, Entity, ManyToOne } from 'typeorm';

import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { CnLabEntity } from '../cn-lab.entity';

export enum CnLabVolumeType {
  CLASSIC = 'CLASSIC',
  HIGH_SPEED = 'HIGH_SPEED',
}

/**
 * Volume of the lab (only for cloud)
 */
@Entity('lab_volume')
export class CnLabVolumeEntity extends CnBaseEntity {
  @Exclude()
  @BlNotUpdatable()
  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  lab: CnLabEntity;

  @BlLuxonDateTimeColumn({ nullable: false })
  startDate: DateTime;

  @BlLuxonDateTimeColumn({ nullable: true })
  endDate: DateTime;

  @Column({ nullable: false, type: 'int' })
  size: number;

  @Column({
    type: 'enum',
    enum: CnLabVolumeType,
    nullable: false,
  })
  type: CnLabVolumeType;

  getEndDateWithDefault(): DateTime {
    return this.endDate ?? ClDateHelper.getDate('9999-12-31');
  }
}

export type CnLabVolume = Omit<CnLabVolumeEntity, 'lab'>;
