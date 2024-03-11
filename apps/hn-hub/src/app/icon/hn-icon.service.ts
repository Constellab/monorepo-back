import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnIcon} from './hn-icon.entity';
import {Like, Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';
import {
  BlAbstractPaginatedService,
  BlBucketConfig,
  BlBucketType,
  BlFile,
  BlNotFoundException,
  BlObjectStorageService
} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {HnIconCreateDto} from './hn-icon.dto';

@Injectable()
export class HnIconService {
  constructor(@InjectRepository(HnIcon)
              private readonly iconRepository: Repository<HnIcon>,
              private readonly objectStorageService: BlObjectStorageService,
              private readonly configService: HnCoreConfigService) {
  }

  async getIcons(page: number, size: number): Promise<ClPage<HnIcon>> {
    return await BlAbstractPaginatedService.findPaginatedStatic(page, size,
      {
        order: {
          name: 'ASC'
        }
      }, this.iconRepository.manager, HnIcon);
  }

  async getIconFile(technicalName: string): Promise<any> {
    const icon: HnIcon = await this.iconRepository.findOneBy({technicalName: technicalName});
    if (!icon) {
      throw new BlNotFoundException('Icon not found');
    }
    return await this.objectStorageService.getObject(this.getBucketConfig(), icon.fileName);
  }

  async getIconById(id: string): Promise<HnIcon> {
    return this.iconRepository.findOneBy({id: id});
  }

  async getIconByTechnicalName(technicalName: string): Promise<HnIcon> {
    return this.iconRepository.findOneBy({technicalName: technicalName});
  }

  async createIcon(_icon: HnIconCreateDto, file: BlFile): Promise<HnIcon> {
    const icon: HnIcon = new HnIcon();
    icon.init(_icon);

    const fileExt = file.originalname.split('.').pop();
    file.originalname = icon.technicalName + '.' + fileExt;

    icon.fileName = await this.objectStorageService.uploadObject([this.getBucketConfig(), this.getBackupBucketConfig()], file,
      {generateRandomObjectName: false});

    return this.iconRepository.save(icon);
  }

  async filterIcons(subNameFilter: string, page: number, size: number): Promise<ClPage<HnIcon>> {
    return await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: {
        subNames: Like('%' + subNameFilter + '%')
      },
      order: {
        name: 'ASC'
      }
    }, this.iconRepository.manager, HnIcon);
  }

  async deleteIcon(id: string): Promise<boolean> {
    const icon: HnIcon = await this.iconRepository.findOneBy({id: id});
    if (!icon) {
      throw new BlNotFoundException('Icon not found');
    }
    await this.objectStorageService.deleteObjectIfExist([this.getBucketConfig(), this.getBackupBucketConfig()], icon.fileName);
    return (await this.iconRepository.delete({id: id})) != null;
  }


  // ------------------------------------------ PRIVATE ------------------------------------------
  private getBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getDefaultObjectStorageEndPoint(),
      region: this.configService.getDefaultObjectStorageRegion(),
      bucket: this.configService.getIconObjectStorageBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials(),
      bucketType: BlBucketType.NORMAL
    };
  }

  private getBackupBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getBackupObjectStorageEndPoint(),
      region: this.configService.getBackupObjectStorageRegion(),
      bucket: this.configService.getIconObjectStorageBackupBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials(),
      bucketType: BlBucketType.NORMAL
    };
  }


}
