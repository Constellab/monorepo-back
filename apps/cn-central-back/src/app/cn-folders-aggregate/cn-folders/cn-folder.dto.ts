import { DateTime } from 'luxon';
import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { CnBucket, CnBucketLocationDTO } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { BlTrim } from '@monorepo/back-core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

export class CnSaveFolderDTO {
  @BlTrim()
  code: string;

  @BlTrim()
  name: string;

  @ClLuxonDateTransform()
  startingDate: DateTime;
  @ClLuxonDateTransform()
  endingDate: DateTime;

  mainStorage?: CnBucketLocationDTO;

  backupStorage?: CnBucketLocationDTO;
}

export interface CnFolderStorageLocationDTO {
  mainStorage: CnBucketLocationDTO;

  backupStorage?: CnBucketLocationDTO;
}

export class CnFolderBucketsDTO {
  @Type(() => CnBucket)
  mainStorage: CnBucket;

  @Type(() => CnBucket)
  backupStorage: CnBucket;
}

export interface CnGetFolderDescriptionDTO {
  description: TeRichTextDTO;
  canEdit: boolean; // true if the current user can edit the description
}
