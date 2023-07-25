import {CnStatusHistory} from '../../cn-core/model/entities/cn-status-history.entity';
import {CnLabInstanceStatus} from './cn-lab-instance-status.enum';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Entity('lab_instance_status_history')
export class CnLabInstanceStatusHistory extends CnStatusHistory<CnLabInstanceStatus> {

  @Column({
    type: 'enum', enum: CnLabInstanceStatus, nullable: false,
    default: CnLabInstanceStatus.SERVER_NOT_CONFIGURED,
  })
  status: CnLabInstanceStatus;

  @Exclude()
  @BlNotUpdatable()
  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  entity: CnLabInstance;
}

