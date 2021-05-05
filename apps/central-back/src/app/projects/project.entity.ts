import {Column, Entity, JoinColumn, OneToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {ProjectStatusHistory} from './project-status-history.entity';
import {EntityWithStatus} from '../core/model/entities/entity-with-status.entity';
import {DateTime} from 'luxon';
import {LuxonDateColumn} from '../core/decorators/luxon-column.decorator';

/**
 * A project is a ensemble of experiments
 */
@Entity()
export class Project extends EntityWithStatus<ProjectStatusHistory> {

  @Column({nullable: false, length: 20})
  code: string;

  @Column({nullable: false, length: 50})
  title: string;

  @Column({type: 'text', nullable: true})
  description: string;

  @LuxonDateColumn({nullable: false})
  startingDate: DateTime;

  @LuxonDateColumn({nullable: true})
  endingDate: DateTime;

  @Type(() => ProjectStatusHistory)
  @OneToOne(() => ProjectStatusHistory, {nullable: true, eager: true})
  @JoinColumn()
  currentStatus: ProjectStatusHistory;
}
