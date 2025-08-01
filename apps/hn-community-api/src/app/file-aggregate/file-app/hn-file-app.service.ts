import { BlBucketConfig, BlBucketType, BlObjectStorageService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnCommunityApp } from '../../community-app-aggregate/community-app/hn-community-app.entity';
import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnAbstractFileService } from '../file-core/hn-abstract-file.service';
import { HnFileApp } from './hn-file-app.entity';

@Injectable()
export class HnFileAppService extends HnAbstractFileService<HnCommunityApp> {
  constructor(
    @InjectRepository(HnFileApp) fileAppRepository: Repository<HnFileApp>,
    objectStorageService: BlObjectStorageService,
    private configService: HnCoreConfigService
  ) {
    super(fileAppRepository, objectStorageService);
  }

  constructEntityFile(): HnFileApp {
    return new HnFileApp();
  }

  getBackupBucketConfig(): BlBucketConfig {
    return {
      type: BlBucketType.NORMAL,
      config: {
        endpoint: this.configService.getBackupObjectStorageEndPoint(),
        region: this.configService.getBackupObjectStorageRegion(),
        bucket: this.configService.getAppFilesObjectStorageBackupBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
    };
  }

  getBucketConfig(): BlBucketConfig {
    return {
      type: BlBucketType.NORMAL,
      config: {
        endpoint: this.configService.getDefaultObjectStorageEndPoint(),
        region: this.configService.getDefaultObjectStorageRegion(),
        bucket: this.configService.getAppFilesObjectStorageBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
    };
  }

  async getAllBucketItemsName(): Promise<any[]> {
    return await this.objectStorageService.getAllObjectsByPrefix(this.getBucketConfig());
  }
}
