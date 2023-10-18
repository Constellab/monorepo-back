import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {Exclude, Expose, Type} from 'class-transformer';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {BlLuxonDateTimeColumn, BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnLabBackupFrequency, CnLabBackupStatus, CnLabBackupTriggerMode} from './cn-lab-backup.dto';
import {CnBucket} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import {DateTime} from 'luxon';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';


@Entity('lab_backup_history')
export class CnLabBackupHistory extends CnBaseEntity {

  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, {onDelete: 'CASCADE', nullable: false})
  @BlNotUpdatable()
  labInstance: CnLabInstance;

  @Column({nullable: false, type: 'enum', enum: CnLabBackupFrequency})
  frequency: CnLabBackupFrequency;

  @Exclude()
  @Type(() => CnBucket)
  @ManyToOne(() => CnBucket, {onDelete: 'CASCADE', nullable: false})
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

  @Column({nullable: false})
  s3Prefix: string;

  // expose only the region, not the bucket
  @Type(() => CnCloudProviderRegion)
  @Expose()
  get region(): CnCloudProviderRegion{
    return this.bucket.region;
  }
}
