import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {Type} from 'class-transformer';

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
  status: CnLabBackupStatus
  message: string;
}

export class CnLabBackupHistory {
  version: number;

  @Type(() => CnLabBackupBucket)
  backups: CnLabBackupBucket[];
}

export class CnLabBackupBucket {
  id: string;
  region: string;
  bucket: string;
  endpoint: string;

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
}
