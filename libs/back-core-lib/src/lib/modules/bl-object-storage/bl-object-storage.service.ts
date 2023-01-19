import {Injectable} from '@nestjs/common';
import {ClStringHelper} from '@monorepo/core-lib';
import {BlFileHelper} from '../../utils/bl-file-helper';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import {BlFile} from '../../models/bl-file.class';
import {IncomingMessage} from 'http';

export interface BlBucketConfig {
  endpoint: string;
  region: string;
  bucket: string;
  credentials: BlObjectStorageCredentials;
}

export interface BlObjectStorageCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

/**
 * Service to communicate with an object storage s3 to store files.
 */
@Injectable()
export class BlObjectStorageService {

  constructor() {
  }

  public generateRandomFileName(extension: string): string {
    return ClStringHelper.generateUUID() + '_' + new Date().getTime() + '.' + extension;
  }

  public async uploadObject(config: BlBucketConfig, obj: BlFile,
                            generateRandomObjectName: boolean = false): Promise<string> {
    const s3Client = this.getClient(config);

    let filename: string;
    if (generateRandomObjectName) {
      const extension = BlFileHelper.getFileExtension(obj.originalname);
      filename = this.generateRandomFileName(extension);
    } else {
      filename = obj.originalname;
    }

    await s3Client.send(new PutObjectCommand({
      Bucket: config.bucket, Key: filename, Body: obj.buffer, ContentType: obj.mimetype
    }));

    return filename;
  }

  public async uploadIncomingMessage(config: BlBucketConfig, message: IncomingMessage,
                                     filename: string, contentType: string): Promise<string> {
    const s3Client = this.getClient(config);

    await s3Client.send(new PutObjectCommand({
      Bucket: config.bucket, Key: filename, Body: message, ContentType: contentType
    }));

    return filename;
  }

  public async uploadJson(config: BlBucketConfig, json: any): Promise<string> {
    const s3Client = this.getClient(config);

    const filename: string = this.generateRandomFileName('json');

    await s3Client.send(new PutObjectCommand({
      Bucket: config.bucket, Key: filename, Body: JSON.stringify(json), ContentType: 'application/json'
    }));

    return filename;
  }

  public async getObject(config: BlBucketConfig, objectName: string): Promise<IncomingMessage> {
    const s3Client = this.getClient(config);

    const result = await s3Client.send(new GetObjectCommand({Bucket: config.bucket, Key: objectName}));

    return result.Body as IncomingMessage;
  }

  /**
   * Delete an object from the bucket.
   * @param config
   * @param objectName
   * @returns true if object deleted, false if object not found
   */
  public async deleteObjectIfExist(config: BlBucketConfig, objectName: string): Promise<boolean> {
    const s3Client = this.getClient(config);

    try {
      // use to check if the object exist
      // because if we call delete on a none existing object, the request never ends
      await s3Client.send(new HeadObjectCommand({Bucket: config.bucket, Key: objectName}));
    } catch (e) {
      return false;
    }

    await s3Client.send(new DeleteObjectCommand({Bucket: config.bucket, Key: objectName}));
    return true;
  }

  public async createBucket(config: BlBucketConfig): Promise<void> {
    const s3Client = this.getClient(config);

    await s3Client.send(new CreateBucketCommand({Bucket: config.bucket}));
  }

  public async deleteBucket(config: BlBucketConfig): Promise<void> {
    const s3Client = this.getClient(config);

    await s3Client.send(new DeleteBucketCommand({Bucket: config.bucket}));
  }


  private getClient(config: BlBucketConfig): S3Client {
    return new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: config.credentials
    });
  }
}
