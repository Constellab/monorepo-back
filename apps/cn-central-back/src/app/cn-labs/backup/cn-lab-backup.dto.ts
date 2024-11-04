import { DateTime } from 'luxon';
import { ClCoreJsonConvert, ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnLabBackupHistory } from './cn-lab-backup-history.entity';

export enum CnLabBackupFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export enum CnLabBackupTriggerMode {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
}

export enum CnLabBackupStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  DELETED = 'DELETED',
}

export interface CnLabBackupStatusObject {
  status: CnLabBackupStatus;
  message: string;
}

export interface CnLabBackupTransferStats {
  sizeInBytes: number;
  durationInSeconds: number;
  speedInBytesPerSecond: number;
  nbErrors: number;
  nbChecks: number;
  nbFile: number;
  nbDeleted: number;
  nbRenamed: number;
}

export interface CnLabBackupInfo {
  status: CnLabBackupStatusObject;
  totalSize: number;
  transfer?: CnLabBackupTransferStats;
}


export class CnLabBackupBucket {
  id: string;
  region: string;
  bucket: string;
  endpoint?: string;

  @ClLuxonDateTimeTransform()
  startUploadAt: DateTime;
  @ClLuxonDateTimeTransform()
  endUploadAt?: DateTime;
  status: CnLabBackupStatus;

  data: CnLabBackupInfo;
  db: CnLabBackupInfo;

  frequency: CnLabBackupFrequency;
  triggerMode: CnLabBackupTriggerMode;
  s3Prefix: string;
}

export class CnLabBackupsHistory {

  private static readonly CURRENT_VERSION = 3;

  version: number;

  @Type(() => CnLabBackupBucket)
  backups: CnLabBackupBucket[];

  // TODO @lab-manager-v1.12.0 : remove once the lab manager is updated
  public static fromLabManagerResponse(backups: CnLabBackupsHistory | CnLabBackupBucket[]): CnLabBackupsHistory {
    let backupsHistory: CnLabBackupsHistory;
    if (Array.isArray(backups)) {
      backupsHistory = new CnLabBackupsHistory();
      backupsHistory.version = 2;
      backupsHistory.backups = ClCoreJsonConvert.deserialize(backups, CnLabBackupBucket) as CnLabBackupBucket[];
    } else {
      backupsHistory = ClCoreJsonConvert.deserialize(backups, CnLabBackupsHistory) as CnLabBackupsHistory;
    }
    return backupsHistory.migrateToV3();
  }

  public migrateToV3(): this {
    if (this.version === 3) return this;

    for (const backup of this.backups as any) {
      if (!backup.data) {
        backup.data = {
          totalSize: backup.dataSize,
          status: backup.dataStatus,
          transfer: null
        } as CnLabBackupInfo;
        delete backup.dataSize;
        delete backup.dataStatus;
      }
      if (!backup.db) {
        backup.db = {
          totalSize: backup.dbSize,
          status: backup.dbStatus,
          transfer: null
        } as CnLabBackupInfo;
        delete backup.dbSize;
        delete backup.dbStatus;
      }

    }
    this.version = CnLabBackupsHistory.CURRENT_VERSION;
    return this;
  }
}


export class CnLabBackupStatusDTO {
  frequency: CnLabBackupFrequency;

  /**
   * Only return the region for the user and not the bucket
   * the user does not need the bucket name (as it is the same for all the labs)
   */
  @Type(() => CnCloudProviderRegion)
  region: CnCloudProviderRegion;

  /**
   * The status of the backup
   * SUCCESS: the backup was successful
   * NONE: no backup was done
   */
  status: 'SUCCESS' | 'DELETED' | 'NONE';

  @ClLuxonDateTimeTransform()
  lastSuccessBackupAt?: DateTime;

  lastSuccessBackupSize?: number;

  lastSuccessBackupId: string;
}


/**
 * DTO to verify the size of the backup
 */
export class CnLabCheckBackupSizeDTO extends CnLabBackupStatusDTO {

  sizeInBucket: number;

  nbDocumentsInBucket: number;

  public static fromBackupStatusDTO(backupStatusDTO: CnLabBackupStatusDTO,
                                    sizeInBucket: number, nbDocumentsInBucket: number): CnLabCheckBackupSizeDTO {
    const dto = new CnLabCheckBackupSizeDTO();
    dto.frequency = backupStatusDTO.frequency;
    dto.region = backupStatusDTO.region;
    dto.status = backupStatusDTO.status;
    dto.lastSuccessBackupAt = backupStatusDTO.lastSuccessBackupAt;
    dto.lastSuccessBackupSize = backupStatusDTO.lastSuccessBackupSize;
    dto.lastSuccessBackupId = backupStatusDTO.lastSuccessBackupId;
    dto.sizeInBucket = sizeInBucket;
    dto.nbDocumentsInBucket = nbDocumentsInBucket;
    return dto;
  }
}

export interface CnSaveBackupHistoryDTO {
  isNew: boolean;
  history: CnLabBackupHistory;
}
