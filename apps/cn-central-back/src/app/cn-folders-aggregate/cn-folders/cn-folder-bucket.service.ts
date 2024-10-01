import { Injectable, Logger } from '@nestjs/common';
import { CnFolderWithStorage } from './cn-folder.entity';
import {
  CnBucket,
  CnBucketContentType,
  CnBucketLocationDTO
} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { BlBadRequestException, BlBucketConfig } from '@monorepo/back-core-lib';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnObjectStoragesAggregateService } from '../../cn-object-storages/cn-object-storages-aggregate.service';
import { CnFolderBucketsDTO } from './cn-folder.dto';
import { CnFoldersService } from './cn-folders.service';
import { ClPage } from '@monorepo/core-lib';

/**
 * Class to handle folder bucket.
 * One bucket can be created by root folder.
 */
@Injectable()
export class CnFolderBucketService {

  protected readonly logger = new Logger(CnFolderBucketService.name);

  constructor(private objectStorageAggregateService: CnObjectStoragesAggregateService,
              private foldersService: CnFoldersService) {
  }


  /////////////////////////////// METHODS ///////////////////////////////

  public async getBucketById(id: string): Promise<CnBucket> {
    return this.objectStorageAggregateService.getBucketByIdNotSecure(id);
  }

  public async getFolderBucket(rootFolderId: string): Promise<CnFolderBucketsDTO> {
    const folder = await this.findFolderWithStorageById(rootFolderId);
    return {
      mainStorage: folder.mainStorage,
      backupStorage: folder.backupStorage
    };
  }

  public async getAndCheckFolderBucket(rootFolderId: string): Promise<CnFolderBucketsDTO> {
    const buckets = await this.getFolderBucket(rootFolderId);
    if (buckets.mainStorage == null) {
      // For now the backup bucket is not mandatory
      throw new BlBadRequestException(CnErrorText.FOLDER_BUCKET_NOT_FOUND);
    }
    return buckets;
  }

  public async getAndCheckFolderBucketConfig(rootFolderId: string): Promise<BlBucketConfig[]> {
    const bucket = await this.getAndCheckFolderBucket(rootFolderId);
    const configs = [bucket.mainStorage.getBucketConfig()];
    if (bucket.backupStorage) {
      configs.push(bucket.backupStorage.getBucketConfig());
    }
    return configs;
  }


  public async getAndCheckFolderMainBucketConfig(rootFolderId: string): Promise<BlBucketConfig> {
    const bucket = await this.getAndCheckFolderBucket(rootFolderId);
    return bucket.mainStorage.getBucketConfig();
  }

  public async findFolderWithStorageById(rootFolderId: string): Promise<CnFolderWithStorage> {
    return await this.foldersService.findById(rootFolderId, {
      mainStorage: CnBucket.configRelation,
      backupStorage: CnBucket.configRelation
    });
  }

  public async findAccessibleFolderBucketLocation(spaceId: string, page: number, size: number)
    : Promise<ClPage<CnBucketLocationDTO>> {
    const buckets = await this.objectStorageAggregateService.searchByContentTypeAndSpaceNotSecure(
      CnBucketContentType.FOLDER, spaceId, page, size);

    return buckets.map((bucket) => bucket.getBucketLocation());
  }


  public async folderUsesLabStorage(rootFolderId: string, labId: string): Promise<boolean> {
    const folder = await this.findFolderWithStorageById(rootFolderId);
    return folder.mainStorage?.lab?.id === labId ||
      folder.backupStorage?.lab?.id === labId;
  }

}
