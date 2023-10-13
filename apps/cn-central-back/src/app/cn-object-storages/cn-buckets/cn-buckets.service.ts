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
export class CnBucketsService extends BlAbstractService<CnBucket>{


  constructor(@InjectRepository(CnBucket) private repository: Repository<CnBucket>,
              private objectStorageService: BlObjectStorageService) {
    super(repository, CnBucket);
  }

  // async onModuleInit(): Promise<void> {
  //   const toDelete: string[] = [
  //     '0b1eee15-59f4-4a0d-b072-2809571c23c5',
  //     // '230aee98-8d1f-48d3-8bf3-6e333a67fe92',
  //     // '2f29615d-d78c-4971-8d2b-5c6a99d62670',
  //     // '3247ac1b-d2cd-4869-946a-2ee4c1e01694',
  //     // '3aa33a55-02e6-4be9-bf3f-e66a95c6f15d',
  //     // '7f7183bb-4109-4c31-8a89-b9c57ac1e2f9',
  //     // '865d32f8-925e-4856-b8ac-712e3af56afa',
  //     // '9ba78366-1485-4405-bdb3-9c381a10e223',
  //     // 'b6e5c8cb-e499-4640-9905-6073ecc0f3cf',
  //     // 'bfe711cd-7405-4d8b-bdc5-6f6882d7fe38',
  //     // 'f3ad96de-7195-4262-a013-19dffe4e5427'
  //   ];
  //
  //
  //   for(const bucketToDelete of toDelete){
  //     const bucket = await this.repository.findOneBy({name: bucketToDelete});
  //     if(bucket){
  //       await this.deleteBucket(bucket);
  //     }else{
  //       await this.objectStorageService.deleteBucket({
  //         bucket: bucketToDelete,
  //         region: 'gra',
  //         credentials: {
  //           accessKeyId: 'ce7e6d93a1f6400fb4c19b3aebaf2547',
  //           secretAccessKey: '04c55d337299410c9858043ede58b717',
  //         },
  //         endpoint: 'https://s3.gra.io.cloud.ovh.net/'
  //       })
  //     }
  //   }
  // }


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

    await this.objectStorageService.deleteBucket(bucket.getBucketConfig(), false);
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

  public findByContentTypeAndObjectId(contentType: CnBucketContentType, objectId: string): Promise<CnBucket[]> {
    if (objectId == null) throw new BlBadRequestException(`The objectId must be defined`);
    return this.repository.find({
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


  public search(searchParam: BlSearchParams,
                page: number, size: number): Promise<ClPage<CnBucket>> {
    const searchBuilder = new BlSearchBuilder<CnBucket>({name: 'ASC'});
    searchBuilder.addSearchParams(searchParam);
    searchBuilder.setRelations(CnBucket.completeRelation);

    return this.findPaginated(page, size, searchBuilder.build());
  }

}
