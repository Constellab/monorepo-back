import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {
  BlBucketConfig,
  BlFile,
  BlImageHelper,
  BlObjectStorageService,
  BlRichTextUploadedImage
} from '@monorepo/back-core-lib';
import {IncomingMessage} from 'http';

@Injectable()
export class CnCommentService<T> {

  protected constructor(protected dataSource: DataSource,
                        private objectStorageService: BlObjectStorageService) {
  }

  async saveImage(file: BlFile, bucketConfig: BlBucketConfig, prefix?: string): Promise<BlRichTextUploadedImage> {
    const imSize = BlImageHelper.getImageSize(file);
    const filename = await this.objectStorageService.uploadObject(bucketConfig, file,
      {generateRandomObjectName: true, prefix: prefix});


    return {
      filename: filename,
      width: imSize.width,
      height: imSize.height
    };
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
