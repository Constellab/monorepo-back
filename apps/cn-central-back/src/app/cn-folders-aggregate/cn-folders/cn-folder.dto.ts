import { DateTime } from 'luxon';
import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { CnBucket, CnBucketLocationDTO } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';


export class CnSaveFolderDTO {
  code: string;
  title: string;

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
