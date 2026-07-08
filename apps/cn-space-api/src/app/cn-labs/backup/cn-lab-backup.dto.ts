import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';

import { CnCloudProviderRegion } from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';

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
  id!: string;
  region!: string;
  bucket!: string;
  endpoint?: string;

  @ClLuxonDateTimeTransform()
  startUploadAt!: DateTime;
  @ClLuxonDateTimeTransform()
  endUploadAt?: DateTime;
  status!: CnLabBackupStatus;

  data!: CnLabBackupInfo;
  db!: CnLabBackupInfo;

  frequency!: CnLabBackupFrequency;
  triggerMode!: CnLabBackupTriggerMode;
  s3Prefix!: string;
}

export class CnLabBackupsHistory {
  version!: number;

  @Type(() => CnLabBackupBucket)
  backups!: CnLabBackupBucket[];
}

export class CnLabBackupStatusDTO {
  frequency!: CnLabBackupFrequency;

  /**
   * Only return the region for the user and not the bucket
   * the user does not need the bucket name (as it is the same for all the labs)
   */
  @Type(() => CnCloudProviderRegion)
  region!: CnCloudProviderRegion;

  /**
   * The status of the backup
   * SUCCESS: the backup was successful
   * NONE: no backup was done
   */
  status!: 'SUCCESS' | 'DELETED' | 'NONE';

  @ClLuxonDateTimeTransform()
  lastSuccessBackupAt?: DateTime;

  lastSuccessBackupSize?: number;

  lastSuccessBackupId!: string;
}

/**
 * DTO to verify the size of the backup
 */
export class CnLabCheckBackupSizeDTO extends CnLabBackupStatusDTO {
  sizeInBucket!: number;

  nbDocumentsInBucket!: number;

  public static fromBackupStatusDTO(
    backupStatusDTO: CnLabBackupStatusDTO,
    sizeInBucket: number,
    nbDocumentsInBucket: number
  ): CnLabCheckBackupSizeDTO {
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
