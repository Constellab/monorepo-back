import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {Type} from 'class-transformer';
import {CnLabInstance} from '../cn-lab-instance.entity';


export enum CnLabStatusRuleAction {
  START_LAB = 'START_LAB',
  STOP_LAB = 'STOP_LAB',
}

export enum CnLabStatusRuleType {
  // Start rules
  START_AFTER_TIME = 'START_AFTER_TIME',

  // Stop rules
  STOP_AFTER_EXPERIMENT = 'STOP_AFTER_EXPERIMENT',
  STOP_AFTER_BACKUP = 'STOP_AFTER_BACKUP',
  STOP_AFTER_TIME = 'STOP_AFTER_TIME',
  STOP_AFTER_INACTIVITY_TIME = 'STOP_AFTER_INACTIVITY_TIME',
}

export interface CnLabStatusRuleStopAfterTimeValue{
  // hours and minutes are based on UTC time
  // after the time is reached, the lab will be stopped
  hours: number;
  minutes: number;
  // list of days of the week when the rule is active
  // based on week days (1 = Monday, 7 = Sunday)
  days: number[];
}

export interface CnLabStatusRuleStopAfterInactivityValue{
  // inactivity time in minutes
  inactivityTime: number;
  // list of days of the week when the rule is active
  // based on week days (1 = Monday, 7 = Sunday)
  days: number[];
}

@Entity('lab_status_rule')
export class CnLabStatusRule extends CnBaseEntity {

  @Column({nullable: false, length: 50, enum: CnLabStatusRuleAction})
  action: CnLabStatusRuleAction;

  @Column({nullable: false, length: 50, enum: CnLabStatusRuleType})
  type: CnLabStatusRuleType;

  @Column({type: 'simple-json', nullable: true})
  value: any;

  @BlNotUpdatable()
  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, {nullable: false})
  labInstance: CnLabInstance;

  /**
   * If false, the rule will be deleted after it is executed
   */
  @Column({nullable: false})
  isPersistent: boolean;


}
