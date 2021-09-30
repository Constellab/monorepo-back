import {StatusHistory} from '../core/model/entities/status-history.entity';
import {LabInstanceStatus} from './lab-instance-status.enum';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {LabInstance} from './lab-instance.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Entity()
export class LabInstanceStatusHistory extends StatusHistory<LabInstanceStatus> {

  @Column({
    type: 'enum', enum: LabInstanceStatus, nullable: false,
    default: LabInstanceStatus.RUNNING
  })
  status: LabInstanceStatus;

  @Exclude()
  @BlNotUpdatable()
  @Type(() => LabInstance)
  @ManyToOne(() => LabInstance, {})
  entity: LabInstance;
}

