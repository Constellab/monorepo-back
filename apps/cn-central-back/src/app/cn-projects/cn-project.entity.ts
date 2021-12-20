import {Column, Entity, JoinColumn, OneToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {CnEntityWithStatus} from '../cn-core/model/entities/cn-entity-with-status.entity';
import {DateTime} from 'luxon';
import {BlLuxonDateColumn} from '@monorepo/back-core-lib';

/**
 * A project is an ensemble of experiments
 */
@Entity('project')
export class CnProject extends CnEntityWithStatus<CnProjectStatusHistory> {

  @Column({nullable: false, length: 20})
  code: string;

  @Column({nullable: false, length: 50})
  title: string;

  @Column({type: 'text', nullable: true})
  description: string;

  @BlLuxonDateColumn({nullable: false})
  startingDate: DateTime;

  @BlLuxonDateColumn({nullable: true})
  endingDate: DateTime;

  @Type(() => CnProjectStatusHistory)
  @OneToOne(() => CnProjectStatusHistory, {nullable: true, eager: true})
  @JoinColumn()
  currentStatus: CnProjectStatusHistory;
}
