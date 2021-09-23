import {BaseEntity} from '../core/model/entities/base.entity';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {Experiment} from '../experiments/experiment.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Entity()
export class Report extends BaseEntity {

  @Exclude()
  @BlNotUpdatable()
  @Type(() => Experiment)
  @ManyToOne(() => Experiment, {nullable: false})
  experiment: Experiment;

  @Column({nullable: false, update: false})
  experimentId: string;
}
