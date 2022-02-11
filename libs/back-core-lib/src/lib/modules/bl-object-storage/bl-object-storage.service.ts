import {Inject, Injectable} from '@nestjs/common';
import {ClStringHelper} from '@monorepo/core-lib';
import {BlFileHelper} from '../../utils/bl-file-helper';
import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {BL_OBJECT_STORAGE_CONFIG_PROVIDER, BlObjectStorageModuleConfig} from './bl-object-storage.class';
import {BlFile} from '../../models/bl-file.class';

@Injectable()
export class BlObjectStorageService {

  constructor(@Inject(BL_OBJECT_STORAGE_CONFIG_PROVIDER) private moduleConfig: BlObjectStorageModuleConfig) {
  }

  public generateRandomFileName(filename: string): string {
    const extension = BlFileHelper.getFileExtension(filename);
    return ClStringHelper.generateUUID() + '_' + new Date().getTime() + extension;
  }

  public async uploadObject(obj: BlFile, bucket: string,
                            generatedRandomObjectName: boolean = false): Promise<string> {
    const s3Client = this.getClient();

    let filename: string;
    if (generatedRandomObjectName) {
      filename = this.generateRandomFileName(obj.originalname);
    } else {
      filename = obj.originalname;
    }

    const results = await s3Client.send(new PutObjectCommand({
      Bucket: bucket, Key: filename, Body: obj.buffer, ContentType: obj.mimetype
    }));

    return filename;
  }

  public async getObject(objectName: string, bucket: string): Promise<any> {
    const s3Client = this.getClient();

    return await s3Client.send(new GetObjectCommand({Bucket: bucket, Key: objectName}));
  }

  public async deleteObject(objectName: string, bucket: string): Promise<void> {
    const s3Client = this.getClient();

    await s3Client.send(new DeleteObjectCommand({Bucket: bucket, Key: objectName}));
  }

  private getClient(): S3Client {
    return new S3Client({endpoint: this.moduleConfig.endpoint, region: this.moduleConfig.region});
  }
}
