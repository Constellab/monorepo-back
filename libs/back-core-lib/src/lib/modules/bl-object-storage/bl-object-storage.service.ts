import {Injectable, Logger} from '@nestjs/common';
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
  NoSuchKey,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import {BlFile} from '../../models/bl-file.class';
import {IncomingMessage} from 'http';
import {_Object} from '@aws-sdk/client-s3/dist-types/models/models_0';
import {BlObjectStorageSyncResult} from './bl-object-storage.class';
import {BlBadRequestException} from '../../exceptions/bl-bad-request.exception';
import {BlNotFoundException} from '../../exceptions/bl-not-found.exception';

export enum BlBucketType {
  NORMAL = 'NORMAL',
  LAB = 'LAB' // bucket hosted on a lab
}

export interface BlBucketConfig {
  endpoint: string;
  region: string;
  bucket: string;
  credentials: BlObjectStorageCredentials;
  bucketType: BlBucketType; // true if the bucket is hosted on a lab, false if this is a class S3 bucket
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
  private readonly logger = new Logger(BlObjectStorageService.name);

  public generateRandomFileNameFromExtension(extension: string): string {
    return ClStringHelper.generateUUID() + '_' + new Date().getTime() + '.' + extension;
  }

  /**
   * Retrieve the extension of the file name then generate a random name with this extension
   * @param filename
   */
  public generateRandomFileName(filename: string): string {
    return this.generateRandomFileNameFromExtension(BlFileHelper.getFileExtension(filename));
  }

  //////////////////////////////////////////// UPLOAD OBJECT /////////////////////////////////////////

  public async uploadObject(config: BlBucketConfig | BlBucketConfig[], obj: BlFile,
                            options: BlObjectStorageUploadOptions = {}): Promise<string> {
    const filename = this.getFilename(options, BlFileHelper.getFileExtension(obj.originalname), obj.originalname);

    return this.uploadObjectToBuckets(config, obj.buffer, filename, obj.mimetype);
  }


  public async uploadIncomingMessage(config: BlBucketConfig | BlBucketConfig[], message: IncomingMessage,
                                     filename: string, contentType: string): Promise<string> {
    return this.uploadObjectToBuckets(config, message, filename, contentType);
  }


  public async uploadJson(config: BlBucketConfig | BlBucketConfig[], json: any,
                          options: BlObjectStorageUploadOptions = {}): Promise<string> {
    const filename = this.getFilename(options, 'json');
    return this.uploadObjectToBuckets(config, JSON.stringify(json), filename, 'application/json');
  }

  private async uploadObjectToBuckets(bucketConfigs: BlBucketConfig | BlBucketConfig[], obj: any, filename: string,
                                      contentType: string): Promise<string> {
    const configs: BlBucketConfig[] = ClHelpService.convertObjectOrArrayToArray(bucketConfigs);

    const promises = configs.map((conf) =>
      this.uploadObjectToBucket(conf, obj, filename, contentType));
    await Promise.all(promises);

    return filename;
  }

  private async uploadObjectToBucket(config: BlBucketConfig, obj: any, filename: string,
                                     contentType: string): Promise<string> {
    const s3Client = this.getClient(config);

    await s3Client.send(new PutObjectCommand({
      Bucket: config.bucket, Key: filename, Body: obj, ContentType: contentType,
    }));

    return filename;
  }

  //////////////////////////////////////////// DOWNLOAD OBJECT /////////////////////////////////////////

  public async getObject(config: BlBucketConfig, objectName: string): Promise<IncomingMessage> {
    const s3Client = this.getClient(config);

    try {
      const result = await s3Client.send(new GetObjectCommand({Bucket: config.bucket, Key: objectName}));
      return result.Body as any as IncomingMessage;
    } catch (e) {
      if (e instanceof NoSuchKey) {
        throw new BlNotFoundException('Object not found');
      }
      this.logger.error(`Error while getting object ${objectName} from bucket ${config.bucket}. Error ${e}`);
      throw new BlBadRequestException('Error while getting object');
    }

  }

  public async getObjectsByPrefix(config: BlBucketConfig, prefix: string = '', pageSize: number = 1000): Promise<_Object[]> {
    const s3Client = this.getClient(config);

    const result = await s3Client.send(new ListObjectsCommand({
      Bucket: config.bucket, Prefix: prefix,
      MaxKeys: pageSize
    }));
    return result.Contents ?? [];
  }

  public getObjectInfo(config: BlBucketConfig, objectName: string): Promise<HeadObjectCommandOutput> {
    const s3Client = this.getClient(config);

    return s3Client.send(new HeadObjectCommand({Bucket: config.bucket, Key: objectName}));
  }

  public async objectExist(config: BlBucketConfig, objectName: string): Promise<boolean> {
    try {
      await this.getObjectInfo(config, objectName);
      return true;
    } catch (e) {
      return false;
    }
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

  //////////////////////////////////////////// DELETE OBJECT /////////////////////////////////////////

  /**
   * Delete an object from the bucket.
   * @param config
   * @param objectName
   * @returns true if object deleted, false if object not found
   */
  public async deleteObjectIfExist(config: BlBucketConfig | BlBucketConfig[], objectName: string): Promise<boolean> {
    const bucketConfigs = ClHelpService.convertObjectOrArrayToArray(config);

    const promises: Promise<boolean>[] = [];

    for (const bucketConfig of bucketConfigs) {
      promises.push(this.deleteObjectIfExistFromBucket(bucketConfig, objectName));
    }

    const results = await Promise.all(promises);
    return results.some((res) => res);
  }

  /**
   * Delete an object from the bucket.
   * @param config
   * @param objectName
   * @returns true if object deleted, false if object not found
   */
  private async deleteObjectIfExistFromBucket(config: BlBucketConfig, objectName: string): Promise<boolean> {
    const s3Client = this.getClient(config);

    if (!(await this.objectExist(config, objectName))) return false;

    await s3Client.send(new DeleteObjectCommand({Bucket: config.bucket, Key: objectName}));
    return true;
  }

  public async deleteObjectsByPrefix(config: BlBucketConfig | BlBucketConfig[], prefix: string): Promise<void> {
    const bucketConfigs = ClHelpService.convertObjectOrArrayToArray(config);

    const promises: Promise<void>[] = [];

    for (const bucketConfig of bucketConfigs) {
      const objects = await this.getObjectsByPrefix(bucketConfig, prefix);
      promises.push(this.deleteMultipleObjects(config, objects.map((obj) => obj.Key)));
    }

    await Promise.all(promises);
  }

  public async deleteAllObjects(config: BlBucketConfig | BlBucketConfig[]): Promise<void> {
    const bucketConfigs = ClHelpService.convertObjectOrArrayToArray(config);

    let count = 0;
    while (count < 100) {
      const promises: Promise<void>[] = [];
      let objectTotal = 0;
      for (const bucketConfig of bucketConfigs) {
        const objects = await this.getObjectsByPrefix(bucketConfig, '', 1000);
        if (objects.length === 0) continue;
        objectTotal += objects.length;
        promises.push(this.deleteMultipleObjects(config, objects.map((obj) => obj.Key)));
      }

      if (objectTotal === 0) break;

      await Promise.all(promises);
      count++;
    }

    if (count >= 1000) {
      throw new Error('Too many objects to delete');
    }
  }

  public async deleteMultipleObjects(config: BlBucketConfig | BlBucketConfig[], objectNames: string[]): Promise<void> {
    if (ClHelpService.isNullOrEmpty(objectNames)) return;

    const bucketConfigs = ClHelpService.convertObjectOrArrayToArray(config);

    const promises: Promise<void>[] = [];

    for (const bucketConfig of bucketConfigs) {
      const s3Client = this.getClient(bucketConfig);

      await s3Client.send(new DeleteObjectsCommand({
        Bucket: bucketConfig.bucket,
        Delete: {Objects: objectNames.map((name) => ({Key: name}))}
      }));
    }

    await Promise.all(promises);
  }


  ////////////////////////////////////////// BUCKET //////////////////////////////////////////

  public async createBucket(config: BlBucketConfig): Promise<void> {
    const s3Client = this.getClient(config);

    await s3Client.send(new CreateBucketCommand({Bucket: config.bucket}));
  }

  /**
   *
   * @param config bucket config
   * @param errorIfNotExist if true throw an error if the bucket does not exist
   * @param force if true delete the bucket even if it is not empty
   */
  public async deleteBucket(config: BlBucketConfig, errorIfNotExist: boolean = true,
                            force: boolean = false): Promise<void> {

    if (!await this.bucketExist(config)) {
      if (errorIfNotExist) {
        throw new Error(`The bucket ${config.bucket} does not exist`);
      } else {
        return;
      }
    }

    if (!(await this.bucketIsEmpty(config))) {
      if (!force) {
        throw new Error(`The bucket ${config.bucket} is not empty`);
      } else {
        // to be deleted we need to delete all objects first
        await this.deleteAllObjects(config);
      }
    }
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

  public async bucketIsEmpty(config: BlBucketConfig): Promise<boolean> {
    const objects = await this.getObjectsByPrefix(config, '', 1);
    return objects.length === 0;
  }

  /////////////////////////////////// SYNC ///////////////////////////////////
  /**
   * Synchronise the content of two buckets. The destination bucket will have the same content as the source bucket.
   * /!\ It deletes the object from the destination bucket that are not present in the source bucket
   * @param source
   * @param destination
   */
  public async synchroniseBuckets(source: BlBucketConfig, destination: BlBucketConfig): Promise<BlObjectStorageSyncResult> {

    const result: BlObjectStorageSyncResult = {
      copiedObjectsFromSource: [], deletedObjectsFromDestination: [],
      modifiedObjectsFromSource: []
    };
    const sourceObjects = await this.getObjectsByPrefix(source, '');
    const destinationObjects = await this.getObjectsByPrefix(destination, '');

    // add the missing objects on the destination
    for (const sourceObject of sourceObjects) {
      const destinationObject = destinationObjects.find((obj) => obj.Key === sourceObject.Key);
      if (destinationObject == null) {
        await this.copyObject(source, destination, sourceObject.Key);
        result.copiedObjectsFromSource.push(sourceObject.Key);
      } else if (sourceObject.Size !== destinationObject.Size) {
        await this.copyObject(source, destination, sourceObject.Key);
        result.modifiedObjectsFromSource.push(sourceObject.Key);
      }
    }

    // remove the missing objects from the destination
    for (const destinationObject of destinationObjects) {
      const sourceObject = sourceObjects.find((obj) => obj.Key === destinationObject.Key);
      if (sourceObject == null) {
        result.deletedObjectsFromDestination.push(destinationObject.Key);
      }
    }

    if (result.deletedObjectsFromDestination.length > 0) {
      await this.deleteMultipleObjects(destination, result.deletedObjectsFromDestination);
    }

    return result;
  }

  public async copyObject(source: BlBucketConfig, destination: BlBucketConfig,
                          sourceName: string, destinationName?: string): Promise<void> {
    if (destinationName == null) {
      destinationName = sourceName;
    }
    const s3Client = this.getClient(source);

    const result = await s3Client.send(new GetObjectCommand({Bucket: source.bucket, Key: sourceName}));

    await this.uploadIncomingMessage(destination, result.Body as any, destinationName, result.ContentType);
  }

  public async copyObjectIfExist(source: BlBucketConfig, destination: BlBucketConfig,
                                 sourceName: string, destinationName?: string): Promise<boolean> {
    if (!(await this.objectExist(source, sourceName))) return false;
    await this.copyObject(source, destination, sourceName, destinationName);
    return true;
  }

  /////////////////////////////////// OTHER ///////////////////////////////////


  private getClient(config: BlBucketConfig): S3Client {
    return new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: config.credentials,
      forcePathStyle: true // set the bucket name in the url (not in the domain)
    });
  }

  private getFilename(options: BlObjectStorageUploadOptions, extension: string, defaultName?: string): string {
    let filename: string;
    if (options.filename) {
      filename = options.filename;
    } else if (options.generateRandomObjectName) {
      filename = this.generateRandomFileNameFromExtension(extension);
    } else {
      if (defaultName) {
        filename = defaultName;
      } else {
        filename = this.generateRandomFileNameFromExtension(extension);
      }
    }

    if (options.prefix) {
      filename = options.prefix + '/' + filename;
    }
    return filename;
  }
}
