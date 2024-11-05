import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnAbstractFileService } from '../file-core/hn-abstract-file.service';
import { HnStory } from '../../story/hn-story.entity';
import { HnFileStory } from './hn-file-story.entity';
import { BlBucketConfig, BlBucketType, BlObjectStorageService } from '@monorepo/back-core-lib';
import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnAbstractFileEntityDTO } from '../file-core/hn-abstract-file.dto';
import { HnFileType } from '../file-core/hn-abstract-file.entity';

@Injectable()
export class HnFileStoryService extends HnAbstractFileService<HnStory> {
  constructor(
    @InjectRepository(HnFileStory) private fileStoryRepository: Repository<HnFileStory>,
    objectStorageService: BlObjectStorageService,
    private configService: HnCoreConfigService
  ) {
    super(fileStoryRepository, objectStorageService);
  }

  async findByStory(story: HnStory): Promise<HnFileStory[]> {
    return this.fileStoryRepository.find({ where: { entity: { id: story.id } } });
  }

  async getStoryFiles(story: HnStory): Promise<HnAbstractFileEntityDTO[]> {
    return this.fileStoryRepository
      .findBy({ entity: { id: story.id }, type: HnFileType.FILE })
      .then((files) => files.map((file) => new HnAbstractFileEntityDTO(file)));
  }

  constructEntityFile(): HnFileStory {
    return new HnFileStory();
  }

  async renameFileInBuckets(file: HnFileStory, newName: string): Promise<void> {
    file.fileName = await this.objectStorageService.moveObjectToAnotherBucket(
      this.getBucketConfig(),
      this.getBucketConfig(),
      file.fileName,
      newName
    );
    await this.objectStorageService.moveObjectToAnotherBucket(
      this.getBackupBucketConfig(),
      this.getBackupBucketConfig(),
      file.fileName,
      newName
    );
    await this.fileStoryRepository.save(file);
  }

  getBucketConfig(): BlBucketConfig {
    return {
      type: 's3',
      config: {
        endpoint: this.configService.getDefaultObjectStorageEndPoint(),
        region: this.configService.getDefaultObjectStorageRegion(),
        bucket: this.configService.getStoryFilesObjectStorageBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
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
        bucketType: BlBucketType.NORMAL,
      },
    };
  }
}
