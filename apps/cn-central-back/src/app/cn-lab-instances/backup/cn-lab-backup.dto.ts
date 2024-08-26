import { DateTime } from 'luxon';
import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
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
}

export interface BackupStatusObject {
  status: CnLabBackupStatus;
  message: string;
}

export class CnLabBackupsHistory {
  version: number;

  @Type(() => CnLabBackupBucket)
  backups: CnLabBackupBucket[];
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
  dataStatus: BackupStatusObject;
  dbStatus: BackupStatusObject;
  dataSize: number;
  dbSize: number;
  frequency: CnLabBackupFrequency;
  triggerMode: CnLabBackupTriggerMode;
  s3Prefix: string;
}

export class CnLabBackupStatusDTO {
  frequency: CnLabBackupFrequency;

  /**
   * Only return the region for the user and not the bucket
   * the user does not need the bucket name (as it is the same for all the lab instances)
   */
  @Type(() => CnCloudProviderRegion)
  region: CnCloudProviderRegion;

  labVolumeSize: number;

  /**
   * The status of the backup
   * SUCCESS: the backup was successful
   * NONE: no backup was done
   */
  status: 'SUCCESS' | 'NONE';

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
    dto.labVolumeSize = backupStatusDTO.labVolumeSize;
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
