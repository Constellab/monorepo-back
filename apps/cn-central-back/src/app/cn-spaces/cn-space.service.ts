import {Injectable} from '@nestjs/common';
import {CnSpace, CnSpaceType} from './cn-space.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, EntityManager, Repository} from 'typeorm';
import {
  BlAbstractService,
  BlBucketConfig,
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

@Injectable()
export class CnSpaceService extends BlAbstractService<CnSpace> {

  constructor(@InjectRepository(CnSpace) private repository: Repository<CnSpace>,
              private objectStorageService: BlObjectStorageService,
              private configService: CnCoreConfigService) {
    super(repository, CnSpace);
  }

  public async createBasicSpace(space: CnSpace): Promise<CnSpace> {
    space.type = CnSpaceType.BASIC;
    space.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    space.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    return this.create(space);
  }

  public async createPersonalSpace(user: CnUser, entityManager: EntityManager): Promise<CnSpace>{
    const space = new CnSpace();
    space.name = user.fullname;
    space.nbLicenses = 0;
    space.type= CnSpaceType.PERSONAL;
    space.createdBy = user;
    space.lastModifiedBy = user;
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
    await this.deletePhoto(space);
    return super.deleteById(id, entityManager);
  }

  public async uploadPhoto(space: CnSpace, file: BlFile): Promise<CnSpace> {

    await this.deletePhoto(space);

    space.photo = await this.objectStorageService.uploadObject(this.getBucketConfig(), file,
      true);
    return this.update(space);
  }

  private async deletePhoto(space: CnSpace): Promise<void> {
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
      credentials: this.configService.getDefaultObjectStorageCredentials()
    };
  }

  public search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnSpace>>{
    const searchBuilder = new BlSearchBuilder();
    const findOptions = searchBuilder.buildSearchParams(searchParams);


    return this.findPaginated(page, size, findOptions);
  }
}
