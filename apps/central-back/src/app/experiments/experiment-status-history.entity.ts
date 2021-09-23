import {StatusHistory} from '../core/model/entities/status-history.entity';
import {ExperimentStatus} from './experiment-status.enum';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {Experiment} from './experiment.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Entity()
export class ExperimentStatusHistory extends StatusHistory<ExperimentStatus> {

  @Column({type: 'enum', enum: ExperimentStatus, nullable: false, default: ExperimentStatus.STARTED})
  status: ExperimentStatus;

  @Exclude()
  @BlNotUpdatable()
  @Type(() => Experiment)
  @ManyToOne(() => Experiment, {nullable: false})
  entity: Experiment;
}
