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
  BlRichTextUploadedImage
} from '@monorepo/back-core-lib';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {EntityManager} from 'typeorm';
import {CnObjectStoragesAggregateService} from '../../cn-object-storages/cn-object-storages-aggregate.service';
import {IncomingMessage} from 'http';


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

  public async createProjectBucket(rootProject: CnProject, region: CnCloudProviderRegion,
                                   entityManager?: EntityManager): Promise<CnBucket> {
    return this.objectStorageAggregateService.createObjectBucket(CnObjectStoragesAggregateService.LabBackupCredentialName,
      region, 'project-' + rootProject.id, rootProject.spaceId, CnBucketContentType.PROJECT,
      rootProject.id, entityManager);
  }

  public async getProjectBucket(projectId: string): Promise<CnBucket> {
    return this.objectStorageAggregateService.findByContentTypeAndObjectId(CnBucketContentType.PROJECT, projectId);
  }

  public async getAndCheckProjectBucket(rootProjectId: string): Promise<CnBucket> {
    const bucket = await this.getProjectBucket(rootProjectId);
    if (bucket == null) {
      throw new BlBadRequestException(CnErrorText.PROJECT_BUCKET_NOT_FOUND);
    }
    return bucket;
  }

  public async getAndCheckProjectBucketConfig(rootProjectId: string): Promise<BlBucketConfig> {
    const bucket = await this.getAndCheckProjectBucket(rootProjectId);
    return bucket.getBucketConfig();
  }

  public async deleteProjectBucket(rootProjectId: string, entityManager: EntityManager): Promise<void> {
    const bucket = await this.getProjectBucket(rootProjectId);
    if (bucket == null) {
      return;
    }
    await this.objectStorageAggregateService.deleteBucketNotSecure(bucket, entityManager);
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
    const bucketConfig = await this.getAndCheckProjectBucketConfig(rootProjectId);
    return this.objectStorageService.getObject(bucketConfig, filePath);
  }

}
