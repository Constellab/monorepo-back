import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {CnExperiment} from '../cn-experiments/cn-experiment.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Entity('report')
export class Report extends CnBaseEntity {

  @Exclude()
  @BlNotUpdatable()
  @Type(() => CnExperiment)
  @ManyToOne(() => CnExperiment, {nullable: false})
  experiment: CnExperiment;

  @Column({nullable: false, update: false})
  experimentId: string;
}
