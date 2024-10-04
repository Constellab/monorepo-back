import { Column, Entity, ManyToOne } from 'typeorm';
import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { BlNotUpdatable } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { CnLabEntity } from '../cn-lab.entity';

export enum CnLabGreenOptionType {
  // Stop rules
  STOP_AFTER_SCENARIO = 'STOP_AFTER_SCENARIO',
  STOP_AFTER_BACKUP = 'STOP_AFTER_BACKUP',
  STOP_AFTER_TIME = 'STOP_AFTER_TIME',
  STOP_AFTER_INACTIVITY_TIME = 'STOP_AFTER_INACTIVITY_TIME',
}

export interface CnLabGreenOptionStopAfterTimeValue {
  // hours and minutes are based on UTC time
  // after the time is reached, the lab will be stopped
  hours: number;
  minutes: number;
  timezone: string;
}

export interface CnLabGreenOptionStopAfterInactivityValue {
  // inactivity time in minutes
  inactivityDuration: number;
}

@Entity('lab_green_option')
export class CnLabGreenOption extends CnBaseEntity {

  @Column({type: 'enum', nullable: false, enum: CnLabGreenOptionType, update: false})
  type: CnLabGreenOptionType;

  @Column({type: 'simple-json', nullable: true})
  value: any;

  @BlNotUpdatable()
  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, {nullable: false, onDelete: 'CASCADE'})
  lab: CnLabEntity;

  @Column()
  labId: string;

  /**
   * If false, the rule will be deleted after it is executed
   */
  @Column({nullable: false})
  isPersistent: boolean;

}
