import { Injectable } from '@nestjs/common';
import { CnSpace, CnSpaceType } from './cn-space.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Like, Repository } from 'typeorm';
import {
  BlAbstractService,
  BlBadRequestException,
  BlBucketConfig,
  BlBucketType,
  BlFile,
  BlFileResponse,
  BlObjectStorageService,
  BlSearchBuilder,
  BlSearchParams,
} from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnBucket } from '../cn-object-storages/cn-buckets/cn-bucket.entity';

@Injectable()
export class CnSpaceService extends BlAbstractService<CnSpace> {
  constructor(
    @InjectRepository(CnSpace) private repository: Repository<CnSpace>,
    private objectStorageService: BlObjectStorageService,
    private configService: CnCoreConfigService
  ) {
    super(repository, CnSpace);
  }

  public async createEntrepriseSpace(
    name: string,
    defaultFolderBucket: CnBucket,
    defaultFolderBackupBucket: CnBucket | null,
    entityManager: EntityManager
  ): Promise<CnSpace> {
    const space = new CnSpace();

    space.name = name;
    space.type = CnSpaceType.ENTREPRISE;
    space.defaultFolderBucket = defaultFolderBucket;
    space.defaultFolderBackupBucket = defaultFolderBackupBucket;
    space.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    space.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    return this.create(space, entityManager);
  }

  public async createPersonalSpace(
    user: CnUser,
    defaultFolderStorageBucket: CnBucket,
    defaultBackupFolderStorageBucket: CnBucket,
    entityManager: EntityManager
  ): Promise<CnSpace> {
    const space = new CnSpace();
    space.name = user.alias;
    space.type = CnSpaceType.PERSONAL;
    space.createdBy = user;
    space.lastModifiedBy = user;
    space.defaultFolderBucket = defaultFolderStorageBucket;
    space.defaultFolderBackupBucket = defaultBackupFolderStorageBucket;
    return entityManager.save(space);
  }

  public async update(entity: CnSpace, entityManager?: EntityManager): Promise<CnSpace> {
    entity.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    return super.update(entity, entityManager);
  }

  public async getAll(page: number, size: number): Promise<ClPage<CnSpace>> {
    return this.findPaginated(page, size, { order: { name: 'ASC' } });
  }

  public findByDomain(domain: string): Promise<CnSpace | null> {
    return this.repository.findOneBy({ domain });
  }

  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const space = await this.findByIdAndCheck(id, null, entityManager);
    await this.deletePhotoInObjectStorage(space);
    return super.deleteById(id, entityManager);
  }

  public async uploadPhoto(space: CnSpace, file: BlFile): Promise<CnSpace> {
    await this.deletePhotoInObjectStorage(space);

    space.photo = await this.objectStorageService.uploadObject(this.getBucketConfig(), file, {
      generateRandomObjectName: true,
    });
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

  async getPhoto(filename: string): Promise<BlFileResponse> {
    return await this.objectStorageService.downloadObject(this.getBucketConfig(), filename);
  }

  private getBucketConfig(): BlBucketConfig {
    return {
      type: 's3',
      config: {
        endpoint: this.configService.getDefaultObjectStorageEndPoint(),
        region: this.configService.getDefaultObjectStorageRegion(),
        bucket: this.configService.getSpaceImageBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
    };
  }

  public search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnSpace>> {
    const searchBuilder = new BlSearchBuilder<CnSpace>();
    searchBuilder.addSearchParams(searchParams);

    return this.findPaginated(page, size, searchBuilder.build());
  }

  public searchByName(name: string, page: number, size: number): Promise<ClPage<CnSpace>> {
    return this.findPaginated(page, size, { where: { name: Like(`%${name}%`) }, order: { name: 'ASC' } });
  }

  public updateStorageLimit(space: CnSpace, storageLimit: number): Promise<CnSpace> {
    if (space.cloudStorageUsage > storageLimit) {
      throw new BlBadRequestException('The storage limit must be greater than the current storage usage');
    }

    space.cloudStorageLimit = storageLimit;
    return this.update(space);
  }
}
