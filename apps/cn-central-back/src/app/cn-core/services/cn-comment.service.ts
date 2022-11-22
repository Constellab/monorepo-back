import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {BlBucketConfig, BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import imageSize from 'image-size';
import {CnCommentImage} from '../model/entities/cn-comment.entity';
import {CnCoreConfigService} from '../modules/cn-core-config/cn-core-config.service';
import {IncomingMessage} from 'http';

@Injectable()
export class CnCommentService<T> {

  protected constructor(protected dataSource: DataSource,
                        private objectStorageService: BlObjectStorageService,
                        private configService: CnCoreConfigService) {
  }

  async saveImage(files: BlFile[]): Promise<CnCommentImage> {
    const docImage: CnCommentImage = new CnCommentImage();
    for (const file of files) {
      const imSize = imageSize(file.buffer);
      docImage.filename = await this.objectStorageService.uploadObject(this.getBucketConfig(), file,
        true);
      docImage.width = imSize.width;
      docImage.height = imSize.height;
    }
    return docImage;
  }

  async getImage(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(this.getBucketConfig(), filename);
  }

  private getBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getDefaultObjectStorageEndPoint(),
      region: this.configService.getDefaultObjectStorageRegion(),
      bucket: this.configService.getCommentObjectStorageBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials()
    };
  }

  async createComment(comment: T): Promise<T> {
    return this.dataSource.manager.save(comment);
  }
}
