import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Type } from 'class-transformer';
import { BlEntityWithId, BlNotUpdatable } from '@monorepo/back-core-lib';
import { CnLabBackupInfo, CnLabBackupStatus } from './cn-lab-backup.dto';
import { CnLabBackupHistoryEntity } from './cn-lab-backup-history.entity';

export enum CnLabBackupType {
  DATA = 'DATA',
  DB = 'DB',
}

@Entity('lab_backup_history_detail')
@Unique('lab_type', ['history', 'type'])
export class CnLabBackupHistoryDetail extends BlEntityWithId {
  @Type(() => CnLabBackupHistoryEntity)
  @ManyToOne(() => CnLabBackupHistoryEntity, { onDelete: 'CASCADE', nullable: false })
  @BlNotUpdatable()
  history: CnLabBackupHistoryEntity;

  @Column({ nullable: false, type: 'enum', enum: CnLabBackupType })
  type: CnLabBackupType;

  // Data info
  @Column({ nullable: false, type: 'enum', enum: CnLabBackupStatus })
  status: CnLabBackupStatus;

  @Column({ nullable: false, type: 'text' })
  message: string;

  @Column({ nullable: false, default: 0, type: 'bigint' })
  totalSize: number;

  /**
   * Transfer size in bytes
   */
  @Column({ nullable: false, default: 0, type: 'bigint' })
  transferSize: number;

  @Column({ nullable: false, default: 0 })
  transferDuration: number;

  @Column({ nullable: false, default: 0, type: 'bigint' })
  transferSpeed: number;

  @Column({ nullable: false, default: 0 })
  transferNbErrors: number;

  @Column({ nullable: false, default: 0 })
  transferNbChecks: number;

  @Column({ nullable: false, default: 0 })
  transferNbFile: number;

  @Column({ nullable: false, default: 0 })
  transferNbDeleted: number;

  @Column({ nullable: false, default: 0 })
  transferNbRenamed: number;

  public updateInfo(backupInfo: CnLabBackupInfo): void {
    this.totalSize = backupInfo.totalSize;
    this.status = backupInfo.status.status;
    this.message = backupInfo.status.message;
    if (backupInfo.transfer) {
      this.transferSize = backupInfo.transfer.sizeInBytes;
      this.transferDuration = backupInfo.transfer.durationInSeconds;
      this.transferSpeed = backupInfo.transfer.speedInBytesPerSecond;
      this.transferNbErrors = backupInfo.transfer.nbErrors;
      this.transferNbChecks = backupInfo.transfer.nbChecks;
      this.transferNbFile = backupInfo.transfer.nbFile;
      this.transferNbDeleted = backupInfo.transfer.nbDeleted;
      this.transferNbRenamed = backupInfo.transfer.nbRenamed;
    }
  }
}
