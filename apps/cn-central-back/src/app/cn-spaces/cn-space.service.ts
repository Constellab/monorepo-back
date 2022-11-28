import {Injectable} from '@nestjs/common';
import {CnSpace} from './cn-space.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, EntityManager, Repository} from 'typeorm';
import {BlAbstractService, BlBucketConfig, BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {IncomingMessage} from 'http';

@Injectable()
export class CnSpaceService extends BlAbstractService<CnSpace> {

  constructor(@InjectRepository(CnSpace) private repository: Repository<CnSpace>,
              private objectStorageService: BlObjectStorageService,
              private configService: CnCoreConfigService) {
    super(repository, CnSpace);
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
      await this.objectStorageService.deleteObject(this.getBucketConfig(), space.photo);
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
}
