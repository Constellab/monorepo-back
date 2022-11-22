import {BadRequestException, Injectable} from '@nestjs/common';
import {BlAbstractService, BlObjectStorageService} from '@monorepo/back-core-lib';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, Repository} from 'typeorm';
import {CnBucket, CnBucketContentType} from './cn-bucket.entity';
import {ClPage} from '@monorepo/core-lib';


@Injectable()
export class CnBucketsService extends BlAbstractService<CnBucket> {


  constructor(@InjectRepository(CnBucket) private repository: Repository<CnBucket>,
              private objectStorageService: BlObjectStorageService,
              private datasource: DataSource) {
    super(repository, CnBucket);
  }

  public async createBucket(bucket: CnBucket): Promise<CnBucket> {
    bucket = await this.checkBucketBeforeSave(bucket);

    return this.datasource.transaction(async (entityManager) => {
      // create the bucket in DB and then in the object storage
      const bucketDb = await super.create(bucket, entityManager);

      await this.objectStorageService.createBucket(bucketDb.getBucketConfig());

      return bucketDb;
    });
  }

  public async update(bucket: CnBucket, entityManager?: EntityManager): Promise<CnBucket> {
    bucket = await this.checkBucketBeforeSave(bucket);
    return await super.update(bucket, entityManager);
  }

  /**
   * Get the bucket before create or update.
   * Check if a similar bucket already exists.
   * Check if the bucket type requires an organization and the organization is the same as the credentials
   * @param bucket
   * @private
   */
  private async checkBucketBeforeSave(bucket: CnBucket): Promise<CnBucket> {
    // There can be only on bucket of type ORGANIZATION_IMAGE or USER_IMAGE
    if ([CnBucketContentType.ORGANIZATION_IMAGE, CnBucketContentType.USER_IMAGE].includes(bucket.contentType)) {
      const existingBucket = await this.findByContentType(bucket.contentType);
      if (existingBucket.length > 0) {
        throw new BadRequestException(`There is already a bucket of type ${bucket.contentType}`);
      }
      bucket.organization = null;
    } else {
      // all the other type must be associated to an organization
      if (!bucket.organization) {
        throw new BadRequestException(`The bucket must be associated to an organization`);
      }

      if (bucket.contentType === CnBucketContentType.LAB_BACKUP && bucket.objectId == null) {
        throw new BadRequestException(`The bucket must be associated to a lab`);
      }

      // There can be only one bucket of type REPORT_IMAGE,REPORT_VIEW,COMMENT_IMAGE per organization
      if ([CnBucketContentType.REPORT_IMAGE, CnBucketContentType.REPORT_VIEW, CnBucketContentType.COMMENT_IMAGE]
        .includes(bucket.contentType)) {
        const existingBucket = await this.findByOrganizationAndContentType(bucket.organization.id, bucket.contentType);
        if (existingBucket.length > 0) {
          // eslint-disable-next-line max-len
          throw new BadRequestException(`There is already a bucket of type ${bucket.contentType} for the organization ${bucket.organization.label}`);
        }
      }
    }

    return bucket;
  }

  public findByContentTypeAndObjectId(contentType: CnBucketContentType, objectId: string): Promise<CnBucket> {
    return this.repository.findOne({
      where: {
        contentType: contentType,
        objectId: objectId
      }
    });
  }

  public async deleteBucket(bucket: CnBucket): Promise<void> {
    await this.datasource.transaction(async (entityManager) => {
      await entityManager.remove(bucket);
      await this.objectStorageService.deleteBucket(bucket.getBucketConfig());
    });
  }

  public async findByOrganizationAndContentType(organizationId: string, contentType: CnBucketContentType): Promise<CnBucket[]> {
    return await this.repository.find({
      where: {
        organization: {id: organizationId},
        contentType: contentType
      }
    });
  }

  public async findByContentType(contentType: CnBucketContentType): Promise<CnBucket[]> {
    return await this.repository.find({
      where: {
        contentType: contentType
      }
    });
  }

  public findAll(page: number, size: number): Promise<ClPage<CnBucket>> {
    return this.findPaginated(page, size);
  }

  public async findLabBackupBucket(labInstanceId: string, organizationId: string): Promise<CnBucket> {
    return await this.repository.findOne({
      where: {
        contentType: CnBucketContentType.LAB_BACKUP,
        objectId: labInstanceId,
        organizationId: organizationId
      },
      relations: {
        credentials: true,
        region: true
      }
    });
  }
}
