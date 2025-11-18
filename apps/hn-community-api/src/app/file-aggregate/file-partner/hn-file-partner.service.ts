import { BlBucketConfig, BlBucketType, BlObjectStorageService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnPartner } from '../../partner/hn-partner.entity';
import { HnAbstractFileService } from '../file-core/hn-abstract-file.service';
import { HnFilePartner } from './hn-file-partner.entity';

@Injectable()
export class HnFilePartnerService extends HnAbstractFileService<HnPartner> {
  constructor(
    @InjectRepository(HnFilePartner) filePartnerRepository: Repository<HnFilePartner>,
    objectStorageService: BlObjectStorageService,
    private configService: HnCoreConfigService
  ) {
    super(filePartnerRepository, objectStorageService);
  }

  constructEntityFile(): HnFilePartner {
    return new HnFilePartner();
  }

  getBucketConfig(): BlBucketConfig {
    return {
      type: BlBucketType.NORMAL,
      config: {
        endpoint: this.configService.getDefaultObjectStorageEndPoint(),
        region: this.configService.getDefaultObjectStorageRegion(),
        bucket: this.configService.getPartnerFilesObjectStorageBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
    };
  }

  getBackupBucketConfig(): BlBucketConfig {
    return {
      type: BlBucketType.NORMAL,
      config: {
        endpoint: this.configService.getBackupObjectStorageEndPoint(),
        region: this.configService.getBackupObjectStorageRegion(),
        bucket: this.configService.getPartnerFilesObjectStorageBackupBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
    };
  }

  async getAllBucketItemsName(): Promise<any[]> {
    return await this.objectStorageService.getAllObjectsByPrefix(this.getBucketConfig());
  }
}
