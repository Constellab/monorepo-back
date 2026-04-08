import {
  BlAbstractPaginatedService,
  BlBucketConfig,
  BlBucketType,
  BlFile,
  BlFileResponse,
  BlNotFoundException,
  BlObjectStorageService,
} from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnIconCreateDto } from './hn-icon.dto';
import { HnIcon } from './hn-icon.entity';

@Injectable()
export class HnIconService {
  constructor(
    @InjectRepository(HnIcon)
    private readonly iconRepository: Repository<HnIcon>,
    private readonly spaceAggregateService: HnSpaceAggregateService,
    private readonly objectStorageService: BlObjectStorageService,
    private readonly configService: HnCoreConfigService
  ) {}

  async getIcons(page: number, size: number): Promise<ClPage<HnIcon>> {
    return await BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        order: {
          name: 'ASC',
        },
      },
      this.iconRepository.manager,
      HnIcon
    );
  }

  async getIconFile(technicalName: string): Promise<BlFileResponse> {
    const icon: HnIcon = await this.iconRepository.findOneBy({ technicalName: technicalName });
    if (!icon) {
      throw new BlNotFoundException('Icon not found');
    }
    return await this.objectStorageService.downloadObject(this.getBucketConfig(), icon.fileName);
  }

  async getIconById(id: string): Promise<HnIcon> {
    return this.iconRepository.findOneBy({ id: id });
  }

  async getIconByTechnicalName(technicalName: string): Promise<HnIcon> {
    return this.iconRepository.findOneBy({ technicalName: technicalName });
  }

  async createIcon(_icon: HnIconCreateDto, file: BlFile): Promise<HnIcon> {
    await this.spaceAggregateService.assertCurrentUserIsInGencoverySpace();

    const icon: HnIcon = new HnIcon();
    icon.init(_icon);

    if (file.size > 50000) throw new BlNotFoundException('Icon file size is too big');

    const fileExt = file.originalname.split('.').pop();
    file.originalname = icon.technicalName + '.' + fileExt;

    icon.fileName = await this.objectStorageService.uploadObject(
      [this.getBucketConfig(), this.getBackupBucketConfig()],
      file,
      { generateRandomObjectName: false }
    );

    return this.iconRepository.save(icon);
  }

  async updateIcon(_icon: HnIconCreateDto, file: BlFile): Promise<HnIcon> {
    await this.spaceAggregateService.assertCurrentUserIsInGencoverySpace();

    if (_icon.id == null) throw new BlNotFoundException('Icon id is missing');
    const icon: HnIcon = await this.iconRepository.findOneBy({ id: _icon.id });
    if (!icon) {
      throw new BlNotFoundException('Icon not found');
    }
    if (file?.size > 50000) throw new BlNotFoundException('Icon file size is too big');

    icon.subNames = _icon.subNames.split(',');
    icon.name = _icon.name;
    icon.technicalName = _icon.technicalName;
    icon.type = _icon.type;

    if (file == null) return this.iconRepository.save(icon);

    const fileExt = file.originalname.split('.').pop();
    file.originalname = icon.technicalName + '.' + fileExt;

    const newFileName = await this.objectStorageService.uploadObject(
      [this.getBucketConfig(), this.getBackupBucketConfig()],
      file,
      { generateRandomObjectName: false }
    );

    if (newFileName != null) {
      await this.deleteIconFile(icon.fileName);
      icon.fileName = newFileName;
    }

    return this.iconRepository.save(icon);
  }

  async filterIcons(subNameFilter: string, page: number, size: number): Promise<ClPage<HnIcon>> {
    return await BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: {
          subNames: Like('%' + ClStringHelper.escapeSqlLike(subNameFilter) + '%'),
        },
        order: {
          name: 'ASC',
        },
      },
      this.iconRepository.manager,
      HnIcon
    );
  }

  async deleteIcon(id: string): Promise<boolean> {
    await this.spaceAggregateService.assertCurrentUserIsInGencoverySpace();

    const icon: HnIcon = await this.iconRepository.findOneBy({ id: id });
    if (!icon) {
      throw new BlNotFoundException('Icon not found');
    }
    await this.deleteIconFile(icon.fileName);
    return (await this.iconRepository.delete({ id: id })) != null;
  }

  async deleteIconFile(fileName: string): Promise<void> {
    await this.objectStorageService.deleteObjectIfExist(
      [this.getBucketConfig(), this.getBackupBucketConfig()],
      fileName
    );
  }

  // ------------------------------------------ PRIVATE ------------------------------------------
  private getBucketConfig(): BlBucketConfig {
    return {
      type: BlBucketType.NORMAL,
      config: {
        endpoint: this.configService.getDefaultObjectStorageEndPoint(),
        region: this.configService.getDefaultObjectStorageRegion(),
        bucket: this.configService.getIconObjectStorageBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
    };
  }

  private getBackupBucketConfig(): BlBucketConfig {
    return {
      type: BlBucketType.NORMAL,
      config: {
        endpoint: this.configService.getBackupObjectStorageEndPoint(),
        region: this.configService.getBackupObjectStorageRegion(),
        bucket: this.configService.getIconObjectStorageBackupBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
    };
  }
}
