import {
  BL_TRANSPORT_SPACE_SPACE_USER_QUEUE,
  BlAbstractService,
  BlBadRequestException,
  BlBucketConfig,
  BlBucketType,
  BlFile,
  BlFileResponse,
  BlObjectStorageService,
  BlSearchBuilder,
  BlSearchParams,
  BlTransportSpaceUserPattern,
} from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { DeleteResult, EntityManager, Like, Repository } from 'typeorm';

import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnBucket } from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnSpace, CnSpaceEntity, CnSpaceType } from './cn-space.entity';

@Injectable()
export class CnSpaceService extends BlAbstractService<CnSpaceEntity> {
  constructor(
    @InjectRepository(CnSpaceEntity) private repository: Repository<CnSpaceEntity>,
    private objectStorageService: BlObjectStorageService,
    private configService: CnCoreConfigService,
    @InjectQueue(BL_TRANSPORT_SPACE_SPACE_USER_QUEUE) private queue: Queue
  ) {
    super(repository, CnSpaceEntity);
  }

  public async createEntrepriseSpace(
    name: string,
    defaultFolderBucket: CnBucket,
    defaultFolderBackupBucket: CnBucket | null,
    entityManager: EntityManager
  ): Promise<CnSpace> {
    const space = new CnSpaceEntity();

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
    const space = new CnSpaceEntity();
    space.name = user.alias;
    space.type = CnSpaceType.PERSONAL;
    space.createdBy = user;
    space.lastModifiedBy = user;
    space.defaultFolderBucket = defaultFolderStorageBucket;
    space.defaultFolderBackupBucket = defaultBackupFolderStorageBucket;
    return entityManager.save(space);
  }

  public async update(entity: CnSpaceEntity, entityManager?: EntityManager): Promise<CnSpaceEntity> {
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
    await this.queue.add(BlTransportSpaceUserPattern.DELETE, { id: space.id });
    return super.deleteById(id, entityManager);
  }

  public async uploadPhoto(space: CnSpace, file: BlFile): Promise<CnSpace> {
    await this.deletePhotoInObjectStorage(space);

    space.photo = await this.objectStorageService.uploadObject(this.getBucketConfig(), file, {
      generateRandomObjectName: true,
    });
    return this.update(space as CnSpaceEntity);
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
      type: BlBucketType.NORMAL,
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
    return this.update(space as CnSpaceEntity);
  }

  public findByIdAndCheckWithBucket(id: string): Promise<CnSpaceEntity> {
    return this.findByIdAndCheck(id, CnSpaceEntity.buckets);
  }
}
