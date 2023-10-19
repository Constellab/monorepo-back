import {Injectable, Logger} from '@nestjs/common';
import {CnProject} from './cn-project.entity';
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
import {CnObjectStoragesAggregateService} from '../../cn-object-storages/cn-object-storages-aggregate.service';
import {IncomingMessage} from 'http';
import {CnProjectBucketsDTO} from './cn-project.dto';
import {CnProjectsService} from './cn-projects.service';

/**
 * Class to handle project bucket.
 * One bucket can be created by project root.
 */
@Injectable()
export class CnProjectBucketService {

  protected readonly logger = new Logger(CnProjectBucketService.name);

  private static readonly DOCUMENT_BUCKET_PREFIX = 'documents';

  // prefix for images in constellab documents
  private static readonly CONSTELLAB_DOC_IMAGE_BUCKET_PREFIX = 'constellab_doc_images';

  private static readonly COMMENT_BUCKET_PREFIX = 'comments';

  // prefix for images in project description
  private static readonly DESCRIPTION_BUCKET_PREFIX = 'description';

  // prefix for reports content
  private static readonly REPORT_BUCKET_PREFIX = 'report_contents';

  constructor(private objectStorageAggregateService: CnObjectStoragesAggregateService,
              private objectStorageService: BlObjectStorageService,
              private projectService: CnProjectsService) {
  }


  public static getPrefix(project: CnProject, type: 'DOCUMENTS' | 'COMMENTS' | 'DESCRIPTION'): string;
  public static getPrefix(project: CnProject, type: 'CONSTELLAB_DOC_IMAGE' | 'REPORT_CONTENTS', parentObjectId: string): string;
  public static getPrefix(project: CnProject,
                          type: 'DOCUMENTS' | 'COMMENTS' | 'DESCRIPTION' | 'CONSTELLAB_DOC_IMAGE' | 'REPORT_CONTENTS',
                          parentObjectId?: string): string {
    let typePrefix: string;
    switch (type) {
      case 'DOCUMENTS':
        typePrefix = CnProjectBucketService.DOCUMENT_BUCKET_PREFIX;
        break;
      case 'COMMENTS':
        typePrefix = CnProjectBucketService.COMMENT_BUCKET_PREFIX;
        break;
      case 'DESCRIPTION':
        typePrefix = CnProjectBucketService.DESCRIPTION_BUCKET_PREFIX;
        break;
      // no project needed for constellab doc images
      case 'CONSTELLAB_DOC_IMAGE':
        typePrefix = CnProjectBucketService.CONSTELLAB_DOC_IMAGE_BUCKET_PREFIX;
        break;
      case 'REPORT_CONTENTS':
        typePrefix = CnProjectBucketService.REPORT_BUCKET_PREFIX;
        break;
    }

    let prefix = `${project.spaceId}/${project.getRootParentId()}/${project.id}/${typePrefix}`;
    if (parentObjectId != null) {
      prefix += `/${parentObjectId}`;
    }
    return prefix;
  }


  /////////////////////////////// METHODS ///////////////////////////////

  public async getBucketByRegion(regionId: string): Promise<CnBucket> {
    return this.objectStorageAggregateService.getBucketByContentTypeAndRegionNotSecure(CnBucketContentType.PROJECT, regionId);
  }

  public async getProjectBucket(projectId: string): Promise<CnProjectBucketsDTO> {
    const project = await this.findProjectWithStorageById(projectId);
    return {
      mainStorage: project.mainStorage,
      backupStorage: project.backupStorage
    };
  }

  public async getAndCheckProjectBucket(rootProjectId: string): Promise<CnProjectBucketsDTO> {
    const buckets = await this.getProjectBucket(rootProjectId);
    if (buckets.mainStorage == null) {
      // For now the backup bucket is not mandatory, because of the bucket number limitation
      // if (buckets.mainBucket == null || buckets.backupBucket == null) {
      throw new BlBadRequestException(CnErrorText.PROJECT_BUCKET_NOT_FOUND);
    }
    return buckets;
  }

  public async getAndCheckProjectBucketConfig(rootProjectId: string): Promise<BlBucketConfig[]> {
    const bucket = await this.getAndCheckProjectBucket(rootProjectId);
    const configs = [bucket.mainStorage.getBucketConfig()];
    if (bucket.backupStorage) {
      configs.push(bucket.backupStorage.getBucketConfig());
    }
    return configs;
  }

  public async getAndCheckProjectMainBucketConfig(rootProjectId: string): Promise<BlBucketConfig> {
    const bucket = await this.getAndCheckProjectBucket(rootProjectId);
    return bucket.mainStorage.getBucketConfig();
  }

  public async findProjectWithStorageById(projectId: string): Promise<CnProject> {
    return await this.projectService.findById(projectId, {
      mainStorage: CnBucket.configRelation,
      backupStorage: CnBucket.configRelation
    });
  }

  /////////////////////////////////////////// DESCRIPTION ///////////////////////////////////////////
  public async saveDescriptionImage(project: CnProject, file: BlFile): Promise<BlRichTextUploadedImage> {
    const bucketConfig = await this.getAndCheckProjectBucketConfig(project.getRootParentId());

    const size = BlImageHelper.getImageSize(file);

    const prefix = CnProjectBucketService.getPrefix(project, 'DESCRIPTION');
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

}
