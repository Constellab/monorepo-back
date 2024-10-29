import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnAbstractFileService } from '../file-core/hn-abstract-file.service';
import { BlBucketConfig, BlBucketType, BlObjectStorageService } from '@monorepo/back-core-lib';
import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnFileDocumentation } from './hn-file-documentation.entity';
import { HnDocumentation } from '../../brick-aggregate/documentation/hn-documentation.entity';
import {HnAbstractFileEntityDTO} from '../file-core/hn-abstract-file.dto';
import { HnFileType } from '../file-core/hn-abstract-file.entity';

@Injectable()
export class HnFileDocumentationService extends HnAbstractFileService<HnDocumentation> {
  constructor(@InjectRepository(HnFileDocumentation) private fileDocumentationRepository: Repository<HnFileDocumentation>,
              objectStorageService: BlObjectStorageService,
              private configService: HnCoreConfigService
  ) {
    super(fileDocumentationRepository, objectStorageService);
  }

  async findByDocumentation(documentation: HnDocumentation): Promise<HnFileDocumentation[]>{
    return this.fileDocumentationRepository.findBy({entity: {id: documentation.id}});
  }

  async getDocFiles(documentation: HnDocumentation): Promise<HnAbstractFileEntityDTO[]> {
    return this.fileDocumentationRepository.findBy({entity: {id: documentation.id}, type: HnFileType.FILE})
      .then(files => files.map(file => new HnAbstractFileEntityDTO(file)));
  }

  constructEntityFile(): HnFileDocumentation {
    return new HnFileDocumentation();
  }

  async renameFileInBuckets(file: HnFileDocumentation, newName: string): Promise<void>{
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
    await this.fileDocumentationRepository.save(file);
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
