import {Column, Entity, OneToMany} from 'typeorm';
import {BaseEntity} from '../core/model/entities/base.entity';
import {Experiment} from '../experiments/experiment.entity';

@Entity()
export class Protocol extends BaseEntity {

  @Column({nullable: false, length: 50})
  label: string;

  @Column({type: 'text', nullable: false})
  json: string;

  @OneToMany(() => Experiment,
    (experiment: Experiment) => experiment.protocol)
  experiments: Experiment[];
}
