import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnAbstractFileService } from '../file-core/hn-abstract-file.service';
import { HnStory } from '../../story/hn-story.entity';
import { HnFileStory } from './hn-file-story.entity';
import { BlBucketConfig, BlBucketType, BlObjectStorageService } from '@monorepo/back-core-lib';
import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';

@Injectable()
export class HnFileStoryService extends HnAbstractFileService<HnStory> {
  constructor(@InjectRepository(HnFileStory) fileStoryRepository: Repository<HnFileStory>,
              objectStorageService: BlObjectStorageService,
              private configService: HnCoreConfigService
  ) {
    super(fileStoryRepository, objectStorageService);
  }

  constructEntityFile(): HnFileStory {
    return new HnFileStory();
  }

  getBucketConfig(): BlBucketConfig {
    return {
      type: 's3',
      config: {
        endpoint: this.configService.getDefaultObjectStorageEndPoint(),
        region: this.configService.getDefaultObjectStorageRegion(),
        bucket: this.configService.getStoryFilesObjectStorageBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL
      }
    };
  }

  getBackupBucketConfig(): BlBucketConfig {
    return {
      type: 's3',
      config: {
        endpoint: this.configService.getBackupObjectStorageEndPoint(),
        region: this.configService.getBackupObjectStorageRegion(),
        bucket: this.configService.getStoryFilesObjectStorageBackupBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL
      }
    };
  }
}
