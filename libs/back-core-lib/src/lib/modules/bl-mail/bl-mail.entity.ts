import { ClDateHelper } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

import { BlLuxonDateTimeColumn } from '../../decorators/bl-luxon-column.decorator';
import { BlEntityWithId } from '../../models/bl-entity-with-id.entity';

export enum BlMailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  ERROR = 'ERROR',
}

@Entity('mail')
export class BlMailEntity extends BlEntityWithId {
  @Column()
  recipients!: string;

  @Column()
  subject!: string;

  @Column({ type: 'text' })
  mail!: string;

  @Column({ type: 'enum', enum: BlMailStatus, default: BlMailStatus.PENDING })
  status!: BlMailStatus;

  @BlLuxonDateTimeColumn()
  lastModifiedAt!: DateTime;

  @Column({ type: 'text', nullable: true })
  error!: string | null;

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}
