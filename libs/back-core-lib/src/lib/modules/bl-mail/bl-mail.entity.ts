import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { BlEntityWithId } from '../../models/bl-entity-with-id.entity';
import { ClDateHelper } from '@monorepo/core-lib';
import { BlLuxonDateTimeColumn } from '../../decorators/bl-luxon-column.decorator';
import { DateTime } from 'luxon';

export enum BlMailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  ERROR = 'ERROR',
}

@Entity('mail')
export class BlMailEntity extends BlEntityWithId {
  @Column()
  recipients: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  mail: string;

  @Column({ type: 'enum', enum: BlMailStatus, default: BlMailStatus.PENDING })
  status: BlMailStatus;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}
