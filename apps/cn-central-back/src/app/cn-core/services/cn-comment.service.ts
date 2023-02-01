import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {BlBucketConfig, BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import imageSize from 'image-size';
import {CnCommentImage} from '../model/entities/cn-comment.entity';
import {IncomingMessage} from 'http';

@Injectable()
export class CnCommentService<T> {

  protected constructor(protected dataSource: DataSource,
                        private objectStorageService: BlObjectStorageService) {
  }

  async saveImage(files: BlFile[], bucketConfig: BlBucketConfig, prefix?: string): Promise<CnCommentImage> {
    const docImage: CnCommentImage = new CnCommentImage();
    for (const file of files) {
      const imSize = imageSize(file.buffer);
      docImage.filename = await this.objectStorageService.uploadObject(bucketConfig, file,
        {generateRandomObjectName: true, prefix: prefix});
      docImage.width = imSize.width;
      docImage.height = imSize.height;
    }
    return docImage;
  }

  async getImage(filename: string, bucketConfig: BlBucketConfig): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(bucketConfig, filename);
  }

  async createComment(comment: T): Promise<T> {
    return this.dataSource.manager.save(comment);
  }

  async deleteComment(comment: T): Promise<T> {
    return this.dataSource.manager.remove(comment);
  }
}
