import { Injectable, Logger } from '@nestjs/common';
import { CnProjectWithStorage } from './cn-project.entity';
import {
  CnBucket,
  CnBucketContentType,
  CnBucketLocationDTO
} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { BlBadRequestException, BlBucketConfig } from '@monorepo/back-core-lib';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnObjectStoragesAggregateService } from '../../cn-object-storages/cn-object-storages-aggregate.service';
import { CnProjectBucketsDTO } from './cn-project.dto';
import { CnProjectsService } from './cn-projects.service';
import { ClPage } from '@monorepo/core-lib';

/**
 * Class to handle project bucket.
 * One bucket can be created by project root.
 */
@Injectable()
export class CnProjectBucketService {

  protected readonly logger = new Logger(CnProjectBucketService.name);

  constructor(private objectStorageAggregateService: CnObjectStoragesAggregateService,
              private projectService: CnProjectsService) {
  }


  /////////////////////////////// METHODS ///////////////////////////////

  public async getBucketById(id: string): Promise<CnBucket> {
    return this.objectStorageAggregateService.getBucketByIdNotSecure(id);
  }

  public async getProjectBucket(projectId: string): Promise<CnProjectBucketsDTO> {
    const project = await this.findProjectWithStorageById(projectId);
    return {
      mainStorage: project.mainStorage,
      backupStorage: project.backupStorage
    };
  }

  public async getAndCheckProjectBucket(projectId: string): Promise<CnProjectBucketsDTO> {
    const buckets = await this.getProjectBucket(projectId);
    if (buckets.mainStorage == null) {
      // For now the backup bucket is not mandatory
      throw new BlBadRequestException(CnErrorText.PROJECT_BUCKET_NOT_FOUND);
    }
    return buckets;
  }

  public async getAndCheckProjectBucketConfig(projectId: string): Promise<BlBucketConfig[]> {
    const bucket = await this.getAndCheckProjectBucket(projectId);
    const configs = [bucket.mainStorage.getBucketConfig()];
    if (bucket.backupStorage) {
      configs.push(bucket.backupStorage.getBucketConfig());
    }
    return configs;
  }


  public async getAndCheckProjectMainBucketConfig(projectId: string): Promise<BlBucketConfig> {
    const bucket = await this.getAndCheckProjectBucket(projectId);
    return bucket.mainStorage.getBucketConfig();
  }

  public async findProjectWithStorageById(projectId: string): Promise<CnProjectWithStorage> {
    return await this.projectService.findById(projectId, {
      mainStorage: CnBucket.configRelation,
      backupStorage: CnBucket.configRelation
    });
  }

  public async findAccessibleProjectBucketLocation(spaceId: string, page: number, size: number)
    : Promise<ClPage<CnBucketLocationDTO>> {
    const buckets = await this.objectStorageAggregateService.searchByContentTypeAndSpaceNotSecure(
      CnBucketContentType.PROJECT, spaceId, page, size);

    return buckets.map((bucket) => bucket.getBucketLocation());
  }


  public async projectUsesLabStorage(projectId: string, labId: string): Promise<boolean> {
    const project = await this.findProjectWithStorageById(projectId);
    return project.mainStorage?.labInstance?.id === labId ||
      project.backupStorage?.labInstance?.id === labId;
  }

}
