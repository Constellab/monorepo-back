import {Injectable} from '@nestjs/common';
import {BlAbstractService, BlBadRequestException, BlObjectStorageService} from '@monorepo/back-core-lib';
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
   * Check if the bucket type requires an space and the space is the same as the credentials
   * @param bucket
   * @private
   */
  private async checkBucketBeforeSave(bucket: CnBucket): Promise<CnBucket> {
    // There can be only one bucket of type SPACE_IMAGE or USER_IMAGE
    if ([CnBucketContentType.SPACE_IMAGE, CnBucketContentType.USER_IMAGE].includes(bucket.contentType)) {
      const existingBucket = await this.findByContentType(bucket.contentType);
      if (existingBucket.length > 0) {
        throw new BlBadRequestException(`There is already a bucket of type ${bucket.contentType}`);
      }
      bucket.space = null;
    } else {
      // all the other type must be associated to a space
      if (!bucket.space) {
        throw new BlBadRequestException(`The bucket must be associated to an space`);
      }

      if (bucket.contentType === CnBucketContentType.LAB_BACKUP && bucket.objectId == null) {
        throw new BlBadRequestException(`The bucket must be associated to a lab`);
      } else if (bucket.contentType === CnBucketContentType.PROJECT && bucket.objectId == null) {
        throw new BlBadRequestException(`The bucket must be associated to a project`);
      }
    }

    return bucket;
  }

  public findByContentTypeAndObjectId(contentType: CnBucketContentType, objectId: string): Promise<CnBucket> {
    if(objectId == null) throw new BlBadRequestException(`The objectId must be defined`);
    return this.repository.findOne({
      where: {
        contentType: contentType,
        objectId: objectId
      },
      relations: {
        region: true,
        credentials: true
      }
    });
  }

  public async deleteBucket(bucketId: string, entityManager: EntityManager): Promise<void> {
    const bucket = await this.findById(bucketId, {credentials: true, region: true});
    await entityManager.remove(bucket);
    await this.objectStorageService.deleteBucket(bucket.getBucketConfig());
  }

  public async findBySpaceAndContentType(spaceId: string, contentType: CnBucketContentType): Promise<CnBucket[]> {
    return await this.repository.find({
      where: {
        space: {id: spaceId},
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
    return this.findPaginated(page, size, {
      relations: {
        region: true,
        space: true,
        credentials: {cloudProvider: true, space: true}
      }
    });
  }

  public async findLabBackupBucket(labInstanceId: string, spaceId: string): Promise<CnBucket> {
    return await this.repository.findOne({
      where: {
        contentType: CnBucketContentType.LAB_BACKUP,
        objectId: labInstanceId,
        space: {id: spaceId}
      },
      relations: {
        credentials: true,
        region: true
      }
    });
  }
}
