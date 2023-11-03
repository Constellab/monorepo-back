import {Injectable} from '@nestjs/common';
import {
  BlAbstractService,
  BlBadRequestException,
  BlBucketType,
  BlObjectStorageService,
  BlSearchBuilder,
  BlSearchParams
} from '@monorepo/back-core-lib';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, Not, Repository} from 'typeorm';
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

    return this.datasource.transaction(async entityManager => {
      // create the bucket in DB and then in the object storage
      const bucketDb = await super.create(bucket, entityManager);
      await this.objectStorageService.createBucket(bucketDb.getBucketConfig());

      return bucketDb;
    });
  }

  public async deleteBucket(bucket: CnBucket, entityManager?: EntityManager): Promise<void> {
    entityManager = this.getEntityManager(entityManager);

    await this.objectStorageService.deleteBucket(bucket.getBucketConfig(), false);
    // delete the bucket in DB and then in the object storage
    await entityManager.delete(CnBucket, bucket.id);
  }

  public async update(bucket: CnBucket, entityManager?: EntityManager): Promise<CnBucket> {
    bucket = await this.checkBucketBeforeSave(bucket);
    await super.update(bucket, entityManager);
    return this.findById(bucket.id, CnBucket.configRelation);
  }

  /**
   * Get the bucket before create or update.
   * Check if a similar bucket already exists.
   * Check if the bucket type requires a space and the space is the same as the credentials
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
    }

    // on cloud region there are only normal buckets
    if (bucket.bucketType === BlBucketType.LAB) {
      if (bucket.labInstance == null) {
        throw new BlBadRequestException(`Lab must be defined for lab bucket`);
      }

      if (bucket.contentType !== CnBucketContentType.PROJECT) {
        throw new BlBadRequestException(`Lab bucket can only be used for projects`);
      }
      // force the name of the lab bucket
      bucket.name = CnBucket.LAB_BUCKET_NAME;
      bucket.region = null;

      const existingBucket = await this.repository.findOne({
        where: {
          labInstance: {
            id: bucket.labInstance.id
          },
          id: bucket.id ? Not(bucket.id) : undefined,
        }
      });

      if (existingBucket != null) {
        throw new BlBadRequestException(`There is already a lab bucket for lab ${bucket.labInstance.name}`);
      }
    }

    if (bucket.bucketType === BlBucketType.NORMAL) {
      if (bucket.region == null) {
        throw new BlBadRequestException(`Region must be defined for normal bucket`);
      }
      bucket.labInstance = null;

      // there can be only one bucket of type by region
      const existingBucket = await this.findByContentTypeAndRegion(bucket.contentType, bucket.region.technicalName);

      if (existingBucket != null && existingBucket.id !== bucket.id) {
        throw new BlBadRequestException(`There is already a bucket of type ${bucket.contentType} in region ${bucket.region.technicalName}`);
      }
    }

    return bucket;
  }

  public async findCompleteById(id: string): Promise<CnBucket> {
    return await this.repository.findOne({
      where: {id: id},
      relations: CnBucket.configRelation
    });
  }

  public async findByContentType(contentType: CnBucketContentType): Promise<CnBucket[]> {
    return await this.repository.find({
      where: {
        contentType: contentType
      },
      relations: CnBucket.configRelation
    });
  }

  public async findByContentTypeAndRegion(contentType: CnBucketContentType, regionId: string): Promise<CnBucket> {
    return await this.repository.findOne({
      where: {
        contentType: contentType,
        region: {
          id: regionId
        },
      },
      relations: CnBucket.configRelation
    });
  }

  public async findByNameAndRegionAndCheck(name: string, regionName: string): Promise<CnBucket> {
    const bucket = await this.repository.findOne({
      where: {
        name: name,
        region: {
          technicalName: regionName
        }
      },
      relations: {
        region: true,
      }
    });
    if (bucket == null) {
      throw new BlBadRequestException(`Bucket ${name} in region ${regionName} not found`);
    }
    return bucket;
  }

  /**
   * Return bucket accessible for a space and a type
   * @param contentType
   * @param spaceId filter bucket of type lab by space
   * @param page
   * @param size
   */
  public async searchByContentTypeAndSpace(contentType: CnBucketContentType, spaceId: string,
                                           page: number, size: number): Promise<ClPage<CnBucket>> {
    return await this.findPaginated(page, size, {
      where: [
        {
          contentType: contentType,
          bucketType: BlBucketType.NORMAL,
        }, {
          contentType: contentType,
          bucketType: BlBucketType.LAB,
          labInstance: {
            spaceId: spaceId
          }
        }],
      relations: CnBucket.configRelation
    });
  }


  public search(searchParam: BlSearchParams,
                page: number, size: number): Promise<ClPage<CnBucket>> {
    const searchBuilder = new BlSearchBuilder<CnBucket>({name: 'ASC'});
    searchBuilder.addSearchParams(searchParam);
    searchBuilder.setRelations(CnBucket.configRelation);

    return this.findPaginated(page, size, searchBuilder.build());
  }

}
