import {Injectable} from '@nestjs/common';
import {ClHelpService, ClStringHelper} from '@monorepo/core-lib';
import {BlFileHelper} from '../../utils/bl-file-helper';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import {BlFile} from '../../models/bl-file.class';
import {IncomingMessage} from 'http';
import {_Object} from '@aws-sdk/client-s3/dist-types/models/models_0';

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

export interface BlObjectStorageUploadOptions {
  // if true generate a random name for the object
  generateRandomObjectName?: boolean;
  // if provided, force the filename of the object
  filename?: string;
  // if provided, the object will be stored in a folder with this prefix
  prefix?: string;
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
                            options: BlObjectStorageUploadOptions = {}): Promise<string> {
    const s3Client = this.getClient(config);

    const filename = this.getFilename(options, BlFileHelper.getFileExtension(obj.originalname), obj.originalname);

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

  public async uploadJson(config: BlBucketConfig, json: any, options: BlObjectStorageUploadOptions = {}): Promise<string> {
    const s3Client = this.getClient(config);

    const filename = this.getFilename(options, 'json');

    await s3Client.send(new PutObjectCommand({
      Bucket: config.bucket, Key: filename, Body: JSON.stringify(json), ContentType: 'application/json'
    }));

    return filename;
  }

  public async getObject(config: BlBucketConfig, objectName: string): Promise<IncomingMessage> {
    const s3Client = this.getClient(config);

    const result = await s3Client.send(new GetObjectCommand({Bucket: config.bucket, Key: objectName}));

    return result.Body as any as IncomingMessage;
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
      await this.getObjectInfo(config, objectName);
    } catch (e) {
      return false;
    }

    await s3Client.send(new DeleteObjectCommand({Bucket: config.bucket, Key: objectName}));
    return true;
  }

  public async deleteObjectsByPrefix(config: BlBucketConfig, prefix: string): Promise<void> {
    const objects = await this.getObjectsByPrefix(config, prefix);

    await this.deleteMultipleObjects(config, objects.map((obj) => obj.Key));
  }

  public async deleteMultipleObjects(config: BlBucketConfig, objectNames: string[]): Promise<void> {
    if (ClHelpService.isNullOrEmpty(objectNames)) return;
    const s3Client = this.getClient(config);

    await s3Client.send(new DeleteObjectsCommand({
      Bucket: config.bucket,
      Delete: {Objects: objectNames.map((name) => ({Key: name}))}
    }));
  }

  public async deleteAllObjects(config: BlBucketConfig): Promise<void> {
    const objects = await this.getObjectsByPrefix(config, '');
    await this.deleteMultipleObjects(config, objects.map((obj) => obj.Key));
  }

  public async getObjectsByPrefix(config: BlBucketConfig, prefix: string): Promise<_Object[]> {
    const s3Client = this.getClient(config);

    const result = await s3Client.send(new ListObjectsCommand({Bucket: config.bucket, Prefix: prefix}));
    return result.Contents ?? [];
  }

  public getObjectInfo(config: BlBucketConfig, objectName: string): Promise<HeadObjectCommandOutput> {
    const s3Client = this.getClient(config);

    return s3Client.send(new HeadObjectCommand({Bucket: config.bucket, Key: objectName}));
  }

  public getObjectAsJson(config: BlBucketConfig, objectName: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getObject(config, objectName)
        .then((message) => {
          let body = '';
          message.on('data', (chunk) => {
            body += chunk;
          });
          message.on('end', () => {
            resolve(JSON.parse(body));
          });
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  ////////////////////////////////////////// BUCKET //////////////////////////////////////////

  public async createBucket(config: BlBucketConfig): Promise<void> {
    const s3Client = this.getClient(config);

    await s3Client.send(new CreateBucketCommand({Bucket: config.bucket}));
  }

  public async deleteBucket(config: BlBucketConfig, errorIfNotExist: boolean = true): Promise<void> {

    if (!await this.bucketExist(config)) {
      if (errorIfNotExist) {
        throw new Error(`The bucket ${config.bucket} does not exist`);
      } else {
        return;
      }
    }
    // to be deleted we need to delete all objects first
    await this.deleteAllObjects(config);
    const s3Client = this.getClient(config);

    await s3Client.send(new DeleteBucketCommand({Bucket: config.bucket}));
  }

  public async bucketExist(config: BlBucketConfig): Promise<boolean> {
    const s3Client = this.getClient(config);

    try {
      await s3Client.send(new HeadBucketCommand({Bucket: config.bucket}));
      return true;
    } catch (e) {
      return false;
    }
  }

  /////////////////////////////////// OTHER ///////////////////////////////////


  private getClient(config: BlBucketConfig): S3Client {
    return new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: config.credentials
    });
  }

  private getFilename(options: BlObjectStorageUploadOptions, extension: string, defaultName?: string): string {
    let filename: string;
    if (options.filename) {
      filename = options.filename;
    } else if (options.generateRandomObjectName) {
      filename = this.generateRandomFileName(extension);
    } else {
      if (defaultName) {
        filename = defaultName;
      } else {
        filename = this.generateRandomFileName(extension);
      }
    }

    if (options.prefix) {
      filename = options.prefix + '/' + filename;
    }
    return filename;
  }
}
