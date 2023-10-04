import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {Type} from 'class-transformer';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnLabBackupFrequency} from './cn-lab-backup.dto';
import {CnBucket} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';

@Entity('lab_backup_option')
export class CnLabBackupOption extends CnBaseEntity {

  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance)
  @BlNotUpdatable()
  labInstance: CnLabInstance;

  @Column({nullable: false, type: 'enum', enum: CnLabBackupFrequency})
  frequency1: CnLabBackupFrequency;

  @Type(() => CnBucket)
  @ManyToOne(() => CnBucket)
  @BlNotUpdatable()
  bucket1: CnBucket;

  @Column({nullable: false, type: 'enum', enum: CnLabBackupFrequency})
  frequency2: CnLabBackupFrequency;

  @Type(() => CnBucket)
  @ManyToOne(() => CnBucket)
  @BlNotUpdatable()
  bucket2: CnBucket;

}
