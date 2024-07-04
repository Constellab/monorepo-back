import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnAbstractFileService } from '../file-core/hn-abstract-file.service';
import { BlBucketConfig, BlBucketType, BlObjectStorageService } from '@monorepo/back-core-lib';
import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnFileLiveTask } from './hn-file-live-task.entity';
import { HnLiveTask } from '../../live-task-aggregate/live-task/hn-live-task.entity';

@Injectable()
export class HnFileLiveTaskService extends HnAbstractFileService<HnLiveTask> {
  constructor(@InjectRepository(HnFileLiveTask) fileDocumentationRepository: Repository<HnFileLiveTask>,
              objectStorageService: BlObjectStorageService,
              private configService: HnCoreConfigService
  ) {
    super(fileDocumentationRepository, objectStorageService);
  }

  constructEntityFile(): HnFileLiveTask {
    return new HnFileLiveTask();
  }

  getBackupBucketConfig(): BlBucketConfig {
    return {
      type: 's3',
      config: {
        endpoint: this.configService.getBackupObjectStorageEndPoint(),
        region: this.configService.getBackupObjectStorageRegion(),
        bucket: this.configService.getLiveTaskFilesObjectStorageBackupBucket(),
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
        bucket: this.configService.getLiveTaskFilesObjectStorageBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL
      }
    };
  }

  async getAllBucketItemsName(): Promise<any[]> {
    return await this.objectStorageService.getAllObjectsByPrefix(this.getBucketConfig());
  }

}
