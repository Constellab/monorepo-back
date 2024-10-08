import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { CnLabEntity } from '../cn-lab.entity';
import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { CnLabBackupFrequency, CnLabBackupStatus, CnLabBackupTriggerMode } from './cn-lab-backup.dto';
import { CnBucket } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { DateTime } from 'luxon';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnLabBackupHistoryDetail } from './cn-lab-backup-history-detail.entity';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';


@Entity('lab_backup_history')
export class CnLabBackupHistoryEntity extends CnBaseEntity {

  // default relation to load the bucket
  public static defaultRelation: FindOptionsRelations<CnLabBackupHistoryEntity> = {
    bucket: CnBucket.configRelation
  };

  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, { onDelete: 'CASCADE', nullable: false })
  @BlNotUpdatable()
  lab: CnLabEntity;

  @Column({ nullable: false, type: 'enum', enum: CnLabBackupFrequency })
  frequency: CnLabBackupFrequency;

  @Exclude()
  @Type(() => CnBucket)
  @ManyToOne(() => CnBucket, { onDelete: 'CASCADE', nullable: false })
  @BlNotUpdatable()
  bucket: CnBucket;

  @Column({ nullable: false, type: 'enum', enum: CnLabBackupTriggerMode })
  triggerMode: CnLabBackupTriggerMode;

  @BlLuxonDateTimeColumn({ nullable: false })
  startedAt: DateTime;

  @BlLuxonDateTimeColumn({ nullable: true })
  endedAt: DateTime;

  @Column({ nullable: false, length: 60, unique: true })
  backupId: string;

  @Column({ nullable: false, type: 'enum', enum: CnLabBackupStatus })
  status: CnLabBackupStatus;

  @OneToMany(() => CnLabBackupHistoryDetail,
    detail => detail.history, { eager: true })
  details: CnLabBackupHistoryDetail[];

  // TODO TO DELETE ONCE MIGRATION IS DONE
  // Data info
  @Column({ nullable: false, type: 'enum', enum: CnLabBackupStatus })
  dataStatus: CnLabBackupStatus;

  @Column({ nullable: false, type: 'text' })
  dataMessage: string;

  @Column({ nullable: false, default: 0 })
  dataSize: number;

  // Db info
  @Column({ nullable: false, type: 'enum', enum: CnLabBackupStatus })
  dbStatus: CnLabBackupStatus;

  @Column({ nullable: false, type: 'text' })
  dbMessage: string;

  @Column({ nullable: false, default: 0 })
  dbSize: number;

  @Column({ nullable: false })
  s3Prefix: string;

  // expose only the region, not the bucket
  @Type(() => CnCloudProviderRegion)
  @Expose()
  get region(): CnCloudProviderRegion {
    return this.bucket.region;
  }

  @Expose()
  get dataDetails(): CnLabBackupHistoryDetail | null {
    if (!this.details) return null;
    return this.details.find(detail => detail.type === 'DATA');
  }

  @Expose()
  get dbDetails(): CnLabBackupHistoryDetail | null {
    if (!this.details) return null;
    return this.details.find(detail => detail.type === 'DB');
  }
}

export type CnLabBucketHistory = Omit<CnLabBackupHistoryEntity, 'lab'>;
