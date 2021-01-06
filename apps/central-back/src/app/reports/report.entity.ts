import {BaseEntity} from '../core/model/entities/base.entity';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {NotUpdatable} from '../core/decorators/not-updatable.decorator';
import {Experiment} from '../experiments/experiment.entity';

@Entity()
export class Report extends BaseEntity {

  @Exclude()
  @NotUpdatable()
  @Type(() => Experiment)
  @ManyToOne(() => Experiment, {nullable: false})
  experiment: Experiment;

  @Column({nullable: false, update: false})
  experimentId: string;
}
