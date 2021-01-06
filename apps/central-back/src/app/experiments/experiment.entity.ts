import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {LabInstance} from '../lab-instances/lab-instance.entity';
import {NotUpdatable} from '../core/decorators/not-updatable.decorator';
import {EntityWithStatus} from '../core/model/entities/entity-with-status.entity';
import {ExperimentStatusHistory} from './experiment-status-history.entity';
import {Study} from '../studies/study.entity';
import {Protocol} from '../protocols/protocol.entity';

/**
 * An experiment is executed in a lab to produce reports
 *
 * It is defined as a succession of jobs
 */
@Entity()
export class Experiment extends EntityWithStatus<ExperimentStatusHistory> {

  @Column({nullable: false, length: 50})
  label: string;

  @Column({type: 'text', nullable: true})
  description: string;

  @NotUpdatable()
  @Type(() => Protocol)
  @ManyToOne(() => Protocol,
    (protocol: Protocol) => protocol.experiments,
    {nullable: true, eager: true})
  protocol: Protocol;

  @Type(() => ExperimentStatusHistory)
  @OneToOne(() => ExperimentStatusHistory, {nullable: true, eager: true})
  @JoinColumn()
  currentStatus: ExperimentStatusHistory;

  @NotUpdatable()
  @Type(() => LabInstance)
  @ManyToOne(() => LabInstance, {nullable: false, eager: true})
  labInstance: LabInstance;

  @NotUpdatable()
  @Type(() => Study)
  @ManyToOne(() => Study, {nullable: false})
  study: Study;

  hasProtocol(): boolean {
    return this.protocol != null;
  }

}
