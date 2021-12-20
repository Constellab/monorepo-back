import {CnStatusHistory} from '../cn-core/model/entities/cn-status-history.entity';
import {CnExperimentStatus} from './cn-experiment-status.enum';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {CnExperiment} from './cn-experiment.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Entity('experiment_status_history')
export class CnExperimentStatusHistory extends CnStatusHistory<CnExperimentStatus> {

  @Column({type: 'enum', enum: CnExperimentStatus, nullable: false, default: CnExperimentStatus.DRAFT})
  status: CnExperimentStatus;

  @Exclude()
  @BlNotUpdatable()
  @Type(() => CnExperiment)
  @ManyToOne(() => CnExperiment, {nullable: false})
  entity: CnExperiment;
}
