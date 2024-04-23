import {Injectable} from '@nestjs/common';
import {CnSpace, CnSpaceType} from './cn-space.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, EntityManager, Like, Repository} from 'typeorm';
import {
  BlAbstractService,
  BlBucketConfig,
  BlBucketType,
  BlFile,
  BlObjectStorageService,
  BlSearchBuilder,
  BlSearchParams
} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {IncomingMessage} from 'http';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnBucket} from '../cn-object-storages/cn-buckets/cn-bucket.entity';

@Injectable()
export class CnSpaceService extends BlAbstractService<CnSpace> {

  constructor(@InjectRepository(CnSpace) private repository: Repository<CnSpace>,
              private objectStorageService: BlObjectStorageService,
              private configService: CnCoreConfigService) {
    super(repository, CnSpace);
  }

  public async createBasicSpace(space: CnSpace, entityManager: EntityManager): Promise<CnSpace> {
    space.type = CnSpaceType.BASIC;
    space.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    space.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    return this.create(space, entityManager);
  }

  public async createPersonalSpace(user: CnUser, defaultProjectStorageBucket: CnBucket,
                                   defaultBackupProjectStorageBucket: CnBucket,
                                   entityManager: EntityManager): Promise<CnSpace> {
    const space = new CnSpace();
    space.name = user.fullname;
    space.nbLicenses = 0;
    space.type = CnSpaceType.PERSONAL;
    space.createdBy = user;
    space.lastModifiedBy = user;
    space.defaultProjectBucket = defaultProjectStorageBucket;
    space.defaultProjectBackupBucket = defaultBackupProjectStorageBucket;
    return entityManager.save(space);
  }

  public async update(entity: CnSpace, entityManager?: EntityManager): Promise<CnSpace> {
    entity.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    return super.update(entity, entityManager);
  }

  public async getAll(page: number, size: number): Promise<ClPage<CnSpace>> {
    return this.findPaginated(page, size, {order: {name: 'ASC'}});
  }

  public findByDomain(domain: string): Promise<CnSpace | null> {
    return this.repository.findOneBy({domain});
  }

  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const space = await this.findByIdAndCheck(id, null, entityManager);
    await this.deletePhotoInObjectStorage(space);
    return super.deleteById(id, entityManager);
  }

  public async uploadPhoto(space: CnSpace, file: BlFile): Promise<CnSpace> {

    await this.deletePhotoInObjectStorage(space);

    space.photo = await this.objectStorageService.uploadObject(this.getBucketConfig(), file,
      {generateRandomObjectName: true});
    return this.update(space);
  }

  public async deletePhoto(space: CnSpace): Promise<CnSpace> {
    await this.deletePhotoInObjectStorage(space);
    space.photo = null;
    return this.repository.save(space);
  }

  private async deletePhotoInObjectStorage(space: CnSpace): Promise<void> {
    if (space.photo) {
      // use the same filename to overwrite the previous file
      await this.objectStorageService.deleteObjectIfExist(this.getBucketConfig(), space.photo);
    }
  }

  async getPhoto(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(this.getBucketConfig(), filename);
  }


  private getBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getDefaultObjectStorageEndPoint(),
      region: this.configService.getDefaultObjectStorageRegion(),
      bucket: this.configService.getSpaceImageBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials(),
      bucketType: BlBucketType.NORMAL,
    };
  }

  public search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnSpace>> {
    const searchBuilder = new BlSearchBuilder<CnSpace>();
    searchBuilder.addSearchParams(searchParams);


    return this.findPaginated(page, size, searchBuilder.build());
  }

  public searchByName(name: string, page: number, size: number): Promise<ClPage<CnSpace>> {
    return this.findPaginated(page, size, {where: {name: Like(`%${name}%`)}, order: {name: 'ASC'}});
  }
}
