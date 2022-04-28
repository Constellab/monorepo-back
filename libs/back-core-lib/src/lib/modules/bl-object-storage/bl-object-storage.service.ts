import {Inject, Injectable} from '@nestjs/common';
import {ClStringHelper} from '@monorepo/core-lib';
import {BlFileHelper} from '../../utils/bl-file-helper';
import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {BL_OBJECT_STORAGE_CONFIG_PROVIDER, BlObjectStorageModuleConfig} from './bl-object-storage.class';
import {BlFile} from '../../models/bl-file.class';
import {IncomingMessage} from 'http';

/**
 * Service to communicate with an object storage s3 to store files.
 */
@Injectable()
export class BlObjectStorageService {

  constructor(@Inject(BL_OBJECT_STORAGE_CONFIG_PROVIDER) private moduleConfig: BlObjectStorageModuleConfig) {
  }

  public generateRandomFileName(extension: string): string {
    return ClStringHelper.generateUUID() + '_' + new Date().getTime() + '.' + extension;
  }

  public async uploadObject(obj: BlFile, bucket: string,
                            generatedRandomObjectName: boolean = false): Promise<string> {
    const s3Client = this.getClient();

    let filename: string;
    if (generatedRandomObjectName) {
      const extension = BlFileHelper.getFileExtension(obj.originalname);
      filename = this.generateRandomFileName(extension);
    } else {
      filename = obj.originalname;
    }

    await s3Client.send(new PutObjectCommand({
      Bucket: bucket, Key: filename, Body: obj.buffer, ContentType: obj.mimetype
    }));

    return filename;
  }

  public async uploadIncomingMessage(message: IncomingMessage, bucket: string,
                                     filename: string, contentType: string): Promise<string> {
    const s3Client = this.getClient();

    await s3Client.send(new PutObjectCommand({
      Bucket: bucket, Key: filename, Body: message, ContentType: contentType
    }));

    return filename;
  }

  public async uploadJson(json: any, bucket: string): Promise<string> {
    const s3Client = this.getClient();

    const filename: string = this.generateRandomFileName('json');

    await s3Client.send(new PutObjectCommand({
      Bucket: bucket, Key: filename, Body: JSON.stringify(json), ContentType: 'application/json'
    }));

    return filename;
  }

  public async getObject(objectName: string, bucket: string): Promise<IncomingMessage> {
    const s3Client = this.getClient();

    const result = await s3Client.send(new GetObjectCommand({Bucket: bucket, Key: objectName}));
    return result.Body as IncomingMessage;
  }

  public async deleteObject(objectName: string, bucket: string): Promise<void> {
    const s3Client = this.getClient();

    await s3Client.send(new DeleteObjectCommand({Bucket: bucket, Key: objectName}));
  }

  private getClient(): S3Client {
    return new S3Client({endpoint: this.moduleConfig.endpoint, region: this.moduleConfig.region});
  }
}
