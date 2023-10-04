import {Injectable} from '@nestjs/common';
import {
  BlAbstractService,
  BlBadRequestException,
  BlObjectStorageService,
  BlSearchBuilder,
  BlSearchParams
} from '@monorepo/back-core-lib';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {CnBucket, CnBucketContentType} from './cn-bucket.entity';
import {ClPage} from '@monorepo/core-lib';


@Injectable()
export class CnBucketsService extends BlAbstractService<CnBucket> {


  constructor(@InjectRepository(CnBucket) private repository: Repository<CnBucket>,
              private objectStorageService: BlObjectStorageService) {
    super(repository, CnBucket);
  }

  public async createBucket(bucket: CnBucket, entityManager?: EntityManager): Promise<CnBucket> {
    bucket = await this.checkBucketBeforeSave(bucket);

    entityManager = this.getEntityManager(entityManager);
    // create the bucket in DB and then in the object storage
    const bucketDb = await super.create(bucket, entityManager);

    await this.objectStorageService.createBucket(bucketDb.getBucketConfig());

    return bucketDb;
  }

  public async deleteBucket(bucket: CnBucket, entityManager?: EntityManager): Promise<void> {
    entityManager = this.getEntityManager(entityManager);

    await this.objectStorageService.deleteBucket(bucket.getBucketConfig());
    // delete the bucket in DB and then in the object storage
    await entityManager.delete(CnBucket, bucket.id);

  }

  public async update(bucket: CnBucket, entityManager?: EntityManager): Promise<CnBucket> {
    bucket = await this.checkBucketBeforeSave(bucket);
    await super.update(bucket, entityManager);
    return this.findById(bucket.id, CnBucket.completeRelation);
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
    if (objectId == null) throw new BlBadRequestException(`The objectId must be defined`);
    return this.repository.findOne({
      where: {
        contentType: contentType,
        objectId: objectId
      },
      relations: CnBucket.configRelation
    });
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
      }
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


  public search(searchParam: BlSearchParams,
                page: number, size: number): Promise<ClPage<CnBucket>> {
    const searchBuilder = new BlSearchBuilder<CnBucket>({name: 'ASC'});
    searchBuilder.addSearchParams(searchParam);
    searchBuilder.setRelations(CnBucket.completeRelation);

    return this.findPaginated(page, size, searchBuilder.build());
  }

}
