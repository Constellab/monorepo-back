import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnAbstractFileService } from '../file-core/hn-abstract-file.service';
import { BlBucketConfig, BlBucketType, BlObjectStorageService } from '@monorepo/back-core-lib';
import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnFileAgent } from './hn-file-agent.entity';
import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';

@Injectable()
export class HnFileAgentService extends HnAbstractFileService<HnAgent> {
  constructor(
    @InjectRepository(HnFileAgent) fileDocumentationRepository: Repository<HnFileAgent>,
                                   objectStorageService: BlObjectStorageService,
    private configService: HnCoreConfigService
  ) {
    super(fileDocumentationRepository, objectStorageService);
  }

  constructEntityFile(): HnFileAgent {
    return new HnFileAgent();
  }

  getBackupBucketConfig(): BlBucketConfig {
    return {
      type: BlBucketType.NORMAL,
      config: {
        endpoint: this.configService.getBackupObjectStorageEndPoint(),
        region: this.configService.getBackupObjectStorageRegion(),
        bucket: this.configService.getAgentFilesObjectStorageBackupBucket(),
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
        bucket: this.configService.getAgentFilesObjectStorageBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
    };
  }

  async getAllBucketItemsName(): Promise<any[]> {
    return await this.objectStorageService.getAllObjectsByPrefix(this.getBucketConfig());
  }
}
