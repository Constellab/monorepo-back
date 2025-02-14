import { DateTime } from 'luxon';
import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { CnBucket, CnBucketLocationDTO } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { BlTrim } from '@monorepo/back-core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { CnTag } from '../cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';

export class CnSaveFolderDTO {
  @BlTrim()
  name: string;

  @BlTrim()
  code?: string;

  @ClLuxonDateTransform()
  startingDate?: DateTime;
  @ClLuxonDateTransform()
  endingDate?: DateTime;

  mainStorage?: CnBucketLocationDTO;

  backupStorage?: CnBucketLocationDTO;

  tags?: CnTag[];
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
