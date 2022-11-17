import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import imageSize from 'image-size';
import {CnCommentImage} from '../model/entities/cn-comment.entity';
import {CnCoreConfigService} from '../modules/cn-core-config/cn-core-config.service';
import {IncomingMessage} from 'http';

@Injectable()
export class CnCommentService<T> {

  protected constructor(
    public dataSource: DataSource,
    private objectStorageService: BlObjectStorageService,
    private configService: CnCoreConfigService) {
  }

  async saveImage(files: BlFile[]): Promise<CnCommentImage> {
    const docImage: CnCommentImage = new CnCommentImage();
    for (const file of files) {
      const imSize = imageSize(file.buffer);
      docImage.filename = await this.objectStorageService.uploadObject(file, this.getCommentBucket(), true);
      docImage.width = imSize.width;
      docImage.height = imSize.height;
    }
    return docImage;
  }

  async getImage(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(filename, this.getCommentBucket());
  }

  private getCommentBucket(): string {
    return this.configService.getCommentObjectStorageBucket();
  }

  async createComment(comment: T): Promise<T> {
    return this.dataSource.manager.save(comment);
  }
}
