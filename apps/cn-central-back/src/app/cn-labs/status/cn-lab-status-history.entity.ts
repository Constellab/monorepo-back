import { CnStatusHistory } from '../../cn-core/model/entities/cn-status-history.entity';
import { CnLabStatus } from './cn-lab-status.enum';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Exclude, Type } from 'class-transformer';
import { CnLabEntity } from '../cn-lab.entity';
import { BlNotUpdatable } from '@monorepo/back-core-lib';

@Entity('lab_status_history')
export class CnLabStatusHistory extends CnStatusHistory<CnLabStatus> {
  @Column({
    type: 'enum',
    enum: CnLabStatus,
    nullable: false,
    default: CnLabStatus.NO_SERVER,
  })
  status: CnLabStatus;

  @Exclude()
  @BlNotUpdatable()
  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  entity: CnLabEntity;
}
