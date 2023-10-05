import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {Type} from 'class-transformer';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {BlLuxonDateTimeColumn, BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnLabBackupFrequency, CnLabBackupStatus, CnLabBackupTriggerMode} from './cn-lab-backup.dto';
import {CnBucket} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import {DateTime} from 'luxon';


@Entity('lab_backup_history')
export class CnLabBackupHistory extends CnBaseEntity {

  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, {onDelete: 'CASCADE'})
  @BlNotUpdatable()
  labInstance: CnLabInstance;

  @Column({nullable: false, type: 'enum', enum: CnLabBackupFrequency})
  frequency: CnLabBackupFrequency;

  @Type(() => CnBucket)
  @ManyToOne(() => CnBucket)
  @BlNotUpdatable()
  bucket: CnBucket;

  @Column({nullable: false, type: 'enum', enum: CnLabBackupTriggerMode})
  triggerMode: CnLabBackupTriggerMode;

  @BlLuxonDateTimeColumn({nullable: false})
  startedAt: DateTime;

  @BlLuxonDateTimeColumn({nullable: true})
  endedAt: DateTime;

  @Column({nullable: false, length: 60, unique: true})
  backupId: string;

  @Column({nullable: false, type: 'enum', enum: CnLabBackupStatus})
  status: CnLabBackupStatus;

  // Data info
  @Column({nullable: false, type: 'enum', enum: CnLabBackupStatus})
  dataStatus: CnLabBackupStatus;

  @Column({nullable: false, type: 'text'})
  dataMessage: string;

  @Column({nullable: false, default: 0})
  dataSize: number;

  // Db info
  @Column({nullable: false, type: 'enum', enum: CnLabBackupStatus})
  dbStatus: CnLabBackupStatus;

  @Column({nullable: false, type: 'text'})
  dbMessage: string;

  @Column({nullable: false, default: 0})
  dbSize: number;
}
