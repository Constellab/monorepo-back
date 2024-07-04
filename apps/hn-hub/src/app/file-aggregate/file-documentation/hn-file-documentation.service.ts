import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnAbstractFileService } from '../file-core/hn-abstract-file.service';
import { BlBucketConfig, BlBucketType, BlObjectStorageService } from '@monorepo/back-core-lib';
import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnFileDocumentation } from './hn-file-documentation.entity';
import { HnDocumentation } from '../../brick-aggregate/documentation/hn-documentation.entity';

@Injectable()
export class HnFileDocumentationService extends HnAbstractFileService<HnDocumentation> {
  constructor(@InjectRepository(HnFileDocumentation) fileDocumentationRepository: Repository<HnFileDocumentation>,
              objectStorageService: BlObjectStorageService,
              private configService: HnCoreConfigService
  ) {
    super(fileDocumentationRepository, objectStorageService);
  }

  constructEntityFile(): HnFileDocumentation {
    return new HnFileDocumentation();
  }

  getBackupBucketConfig(): BlBucketConfig {
    return {
      type: 's3',
      config: {
        endpoint: this.configService.getBackupObjectStorageEndPoint(),
        region: this.configService.getBackupObjectStorageRegion(),
        bucket: this.configService.getDocImageObjectStorageBackupBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL
      }
    };
  }

  getBucketConfig(): BlBucketConfig {
    return {
      type: 's3',
      config: {
        endpoint: this.configService.getDefaultObjectStorageEndPoint(),
        region: this.configService.getDefaultObjectStorageRegion(),
        bucket: this.configService.getDocImageObjectStorageBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL
      }
    }
      ;
  }


}
