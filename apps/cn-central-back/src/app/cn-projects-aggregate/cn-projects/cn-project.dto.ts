import { CnProjectLevelStatus } from './cn-project-level.enum';
import { DateTime } from 'luxon';
import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { CnBucket, CnBucketLocationDTO } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';


export class CnSaveProjectDTO {
  code: string;
  title: string;
  levelStatus: CnProjectLevelStatus;

  @ClLuxonDateTransform()
  startingDate: DateTime;
  @ClLuxonDateTransform()
  endingDate: DateTime;

  mainStorage?: CnBucketLocationDTO;

  backupStorage?: CnBucketLocationDTO;

}

export interface CnProjectStorageLocationDTO {
  mainStorage: CnBucketLocationDTO;

  backupStorage?: CnBucketLocationDTO;
}

export class CnProjectBucketsDTO {
  @Type(() => CnBucket)
  mainStorage: CnBucket;

  @Type(() => CnBucket)
  backupStorage: CnBucket;
}
