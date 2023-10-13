import {Injectable} from '@nestjs/common';
import {CnProject} from '../cn-projects/cn-project.entity';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnBucket, CnBucketContentType} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import {
  BlBadRequestException,
  BlBucketConfig,
  BlFile,
  BlFileHelper,
  BlImageHelper,
  BlObjectStorageService,
  BlObjectStorageSyncResult,
  BlRichTextUploadedImage
} from '@monorepo/back-core-lib';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {EntityManager} from 'typeorm';
import {CnObjectStoragesAggregateService} from '../../cn-object-storages/cn-object-storages-aggregate.service';
import {IncomingMessage} from 'http';
import {CnProjectBucketsDTO} from '../cn-projects/cn-project.dto';

export type CnProjectBucketType = 'MAIN' | 'BACKUP';

/**
 * Class to handle project bucket.
 * One bucket can be created by project root.
 */
@Injectable()
export class CnProjectBucketService {


  private static readonly DOCUMENT_BUCKET_PREFIX = 'documents';

  // prefix for images in constellab documents
  private static readonly CONSTELLAB_DOC_IMAGE_BUCKET_PREFIX = 'constellab_doc_images';

  private static readonly COMMENT_BUCKET_PREFIX = 'comments';

  // prefix for images in project description
  private static readonly DESCRIPTION_BUCKET_PREFIX = 'description';

  // prefix for reports content
  private static readonly REPORT_BUCKET_PREFIX = 'reports';

  constructor(private objectStorageAggregateService: CnObjectStoragesAggregateService,
              private objectStorageService: BlObjectStorageService) {
  }


  public static getPrefix(type: 'DOCUMENTS' | 'COMMENTS' | 'DESCRIPTION', projectId: string): string;
  public static getPrefix(type: 'CONSTELLAB_DOC_IMAGE', documentId: string): string;
  public static getPrefix(type: 'REPORTS', reportId: string): string;
  public static getPrefix(type: 'DOCUMENTS' | 'COMMENTS' | 'DESCRIPTION' | 'CONSTELLAB_DOC_IMAGE' | 'REPORTS',
                          objectId: string): string {
    switch (type) {
      case 'DOCUMENTS':
        return `${CnProjectBucketService.DOCUMENT_BUCKET_PREFIX}/${objectId}`;
      case 'COMMENTS':
        return `${CnProjectBucketService.COMMENT_BUCKET_PREFIX}/${objectId}`;
      case 'DESCRIPTION':
        return `${CnProjectBucketService.DESCRIPTION_BUCKET_PREFIX}/${objectId}`;
      // no project needed for constellab doc images
      case 'CONSTELLAB_DOC_IMAGE':
        return `${CnProjectBucketService.CONSTELLAB_DOC_IMAGE_BUCKET_PREFIX}/${objectId}`;
      case 'REPORTS':
        return `${CnProjectBucketService.REPORT_BUCKET_PREFIX}/${objectId}`;
    }
  }


  /////////////////////////////// METHODS ///////////////////////////////

  public async createProjectBuckets(rootProject: CnProject,
                                    mainRegion: CnCloudProviderRegion,
                                    backupRegion: CnCloudProviderRegion,
                                    entityManager?: EntityManager): Promise<CnProjectBucketsDTO> {
    const mainBucket = await this.objectStorageAggregateService.createObjectBucket(
      CnObjectStoragesAggregateService.LabBackupCredentialName,
      mainRegion, 'project-' + rootProject.id, rootProject.spaceId, CnBucketContentType.PROJECT,
      rootProject.id, 'MAIN' as CnProjectBucketType, entityManager);

    const backupBucket = await this.createProjectBackupBucket(rootProject, backupRegion, entityManager);

    return {
      mainBucket,
      backupBucket
    };
  }

  public async createProjectBackupBucket(rootProject: CnProject,
                                         backupRegion: CnCloudProviderRegion,
                                         entityManager?: EntityManager): Promise<CnBucket> {

    return await this.objectStorageAggregateService.createObjectBucket(
      CnObjectStoragesAggregateService.LabBackupCredentialName,
      backupRegion, 'project-backup-' + rootProject.id, rootProject.spaceId, CnBucketContentType.PROJECT,
      rootProject.id, 'BACKUP' as CnProjectBucketType, entityManager);

  }


  public async getProjectBucket(projectId: string): Promise<CnProjectBucketsDTO> {
    const buckets = await this.objectStorageAggregateService.findByContentTypeAndObjectId(CnBucketContentType.PROJECT, projectId);

    return {
      mainBucket: buckets.find(b => b.additionalInfo === 'MAIN' as CnProjectBucketType),
      backupBucket: buckets.find(b => b.additionalInfo === 'BACKUP' as CnProjectBucketType)
    };

  }

  public async getAndCheckProjectBucket(rootProjectId: string): Promise<CnProjectBucketsDTO> {
    const buckets = await this.getProjectBucket(rootProjectId);
    if (buckets.mainBucket == null || buckets.backupBucket == null) {
      throw new BlBadRequestException(CnErrorText.PROJECT_BUCKET_NOT_FOUND);
    }
    return buckets;
  }

  public async getAndCheckProjectBucketConfig(rootProjectId: string): Promise<BlBucketConfig[]> {
    const bucket = await this.getAndCheckProjectBucket(rootProjectId);
    return [bucket.mainBucket.getBucketConfig(), bucket.backupBucket.getBucketConfig()];
  }

  public async getAndCheckProjectMainBucketConfig(rootProjectId: string): Promise<BlBucketConfig> {
    const bucket = await this.getAndCheckProjectBucket(rootProjectId);
    return bucket.mainBucket.getBucketConfig();
  }

  public async deleteProjectBucket(rootProjectId: string, entityManager: EntityManager): Promise<void> {
    const bucket = await this.getProjectBucket(rootProjectId);
    if (bucket == null) {
      return;
    }
    await this.objectStorageAggregateService.deleteBucketNotSecure(bucket.mainBucket, entityManager);
    await this.objectStorageAggregateService.deleteBucketNotSecure(bucket.backupBucket, entityManager);
  }

  /////////////////////////////////////////// DESCRIPTION ///////////////////////////////////////////
  public async saveDescriptionImage(project: CnProject, file: BlFile): Promise<BlRichTextUploadedImage> {
    const bucketConfig = await this.getAndCheckProjectBucketConfig(project.getRootParentId());

    const size = BlImageHelper.getImageSize(file);

    const prefix = CnProjectBucketService.getPrefix('DESCRIPTION', project.id);
    const extension = BlFileHelper.getFileExtension(file.originalname);
    const filePath = `${prefix}/${this.objectStorageService.generateRandomFileName(extension)}`;

    await this.objectStorageService.uploadObject(bucketConfig, file,
      {filename: filePath});

    return {
      filename: filePath,
      width: size.width,
      height: size.height
    };
  }

  public async getObject(rootProjectId: string, filePath: string): Promise<IncomingMessage> {
    const bucketConfig = await this.getAndCheckProjectMainBucketConfig(rootProjectId);
    return this.objectStorageService.getObject(bucketConfig, filePath);
  }

  //////////////////////////////////////////////// OTHER ////////////////////////////////////////////////

  public async synchroniseBackupBucket(rootProjectId: string): Promise<BlObjectStorageSyncResult> {
    const buckets = await this.getAndCheckProjectBucket(rootProjectId);
    return await this.objectStorageService.synchroniseBuckets(buckets.mainBucket.getBucketConfig(), buckets.backupBucket.getBucketConfig());
  }

}
