import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {
  BlAbstractService,
  BlBucketConfig,
  BlEntityWithId,
  BlFile,
  BlImageHelper,
  BlObjectStorageService,
  BlRichTextUploadedImage
} from '@monorepo/back-core-lib';
import {IncomingMessage} from 'http';

@Injectable()
export class CnCommentService<T extends BlEntityWithId> extends BlAbstractService<T> {

  protected constructor(private objectStorageService: BlObjectStorageService,
                        repository: Repository<T>,
                        entityClass: new() => T) {
    super(repository, entityClass);
  }

  async saveImage(file: BlFile, bucketConfig: BlBucketConfig | BlBucketConfig[], prefix: string): Promise<BlRichTextUploadedImage> {
    const imSize = BlImageHelper.getImageSize(file);
    const filename = this.objectStorageService.generateRandomFileName(imSize.type);
    await this.objectStorageService.uploadObject(bucketConfig, file,
      {filename: filename, prefix: prefix});

    return {
      filename: filename,
      width: imSize.width,
      height: imSize.height
    };
  }

  async getImage(filename: string, bucketConfig: BlBucketConfig, prefix: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(bucketConfig, prefix + '/' + filename);
  }

}
