import { Logger } from '@nestjs/common';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  NoSuchKey,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { BlFileResponse, BlObject, BlS3BucketConfig } from './bl-object-storage.class';
import { BlBadRequestException, BlNotFoundException, BlObjectStorageInterface } from '@monorepo/back-core-lib';
import { Stream } from 'stream';
import { _Object } from '@aws-sdk/client-s3/dist-types/models/models_0';


/**
 * Service to communicate with an object storage s3 to store files.
 */
export class BlS3BucketService implements BlObjectStorageInterface {

  private readonly logger = new Logger(BlS3BucketService.name);

  constructor(private config: BlS3BucketConfig) {
  }

  public async uploadObjectToBucket(obj: Buffer, filename: string,
                                    contentType: string): Promise<string> {
    const s3Client = this.getClient();

    await s3Client.send(new PutObjectCommand({
      Bucket: this.getBucketName(), Key: filename, Body: obj, ContentType: contentType
    }));

    return filename;
  }

  //////////////////////////////////////////// DOWNLOAD OBJECT /////////////////////////////////////////

  public async downloadObject(objectName: string): Promise<BlFileResponse> {
    const s3Client = this.getClient();

    try {
      const result = await s3Client.send(new GetObjectCommand({ Bucket: this.getBucketName(), Key: objectName }));

      return {
        name: objectName,
        file: result.Body as Stream,
        contentType: result.ContentType,
        contentLength: result.ContentLength
      };
    } catch (e) {
      if (e instanceof NoSuchKey) {
        throw new BlNotFoundException('Object not found');
      }
      this.logger.error(`Error while getting object ${objectName} from bucket ${this.getBucketName()}. Error ${e}`);
      throw new BlBadRequestException('Error while getting object');
    }

  }

  //////////////////////////////////////////// GET OBJECT /////////////////////////////////////////

  public async objectExist(objectName: string): Promise<boolean> {
    try {
      await this.getObjectInfo(objectName);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async getObjectInfo(objectName: string): Promise<BlObject> {
    const s3Client = this.getClient();

    const result = await s3Client.send(new HeadObjectCommand({ Bucket: this.getBucketName(), Key: objectName }));

    return {
      name: objectName,
      size: result.ContentLength
    };
  }

  public async getAllObjectsByPrefix(prefix: string = ''): Promise<BlObject[]> {
    const s3Client = this.getClient();

    const pageSize = 1000;
    let pageCount = 0;
    const objects: BlObject[] = [];
    let nextToken: string | undefined = undefined;
    while (pageCount < 1000) {
      const result: ListObjectsCommandOutput = await s3Client.send(new ListObjectsCommand({
        Bucket: this.getBucketName(), Prefix: prefix,
        MaxKeys: pageSize,
        Marker: nextToken
      }));

      if(!result.Contents){
        break;
      }

      objects.push(...(result.Contents.map(object => ({
        name: object.Key,
        size: object.Size
      })) ?? []));

      // stop when the page is not full
      if (result.Contents.length < pageSize) {
        break;
      }
      // get the last key to start from the next page
      nextToken = result.Contents[result.Contents.length - 1].Key;
      pageCount++;
    }

    return objects;
  }


  public async getObjectsByPrefixPaginated(prefix: string = '',
                                           pageSize: number = 1000, startFromKey: string = undefined): Promise<_Object[]> {
    const s3Client = this.getClient();

    const result = await s3Client.send(new ListObjectsCommand({
      Bucket: this.getBucketName(), Prefix: prefix,
      MaxKeys: pageSize, Marker: startFromKey
    }));
    return result.Contents ?? [];
  }

  //////////////////////////////////////////// DELETE OBJECT /////////////////////////////////////////
  /**
   * Delete an object from the bucket.
   * @returns true if object deleted, false if object not found
   */
  public async deleteObjectIfExists(objectName: string): Promise<boolean> {
    const s3Client = this.getClient();

    if (!(await this.objectExist(objectName))) return false;

    await s3Client.send(new DeleteObjectCommand({ Bucket: this.getBucketName(), Key: objectName }));
    return true;
  }


  public async deleteMultipleObjects(objectNames: string[]): Promise<void> {
    const s3Client = this.getClient();

    await s3Client.send(new DeleteObjectsCommand({
      Bucket: this.getBucketName(),
      Delete: { Objects: objectNames.map((name) => ({ Key: name })) }
    }));

  }

  public async deleteAllObjects(): Promise<void> {
    let count = 0;
    while (count < 100) {
      const objects = await this.getObjectsByPrefixPaginated('', 1000);
      if (objects.length === 0) break;

      await this.deleteMultipleObjects(objects.map((obj) => obj.Key));
      count++;
    }

    if (count >= 1000) {
      throw new Error('Too many objects to delete');
    }
  }

  ////////////////////////////////////////// BUCKET //////////////////////////////////////////

  public async createBucket(): Promise<void> {
    const s3Client = this.getClient();

    await s3Client.send(new CreateBucketCommand({ Bucket: this.getBucketName() }));
  }


  public async deleteBucket(): Promise<void> {
    if (!(await this.bucketIsEmpty())) {
      await this.deleteAllObjects();
    }
    const s3Client = this.getClient();

    await s3Client.send(new DeleteBucketCommand({ Bucket: this.getBucketName() }));
  }

  public async bucketExists(): Promise<boolean> {
    const s3Client = this.getClient();

    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: this.getBucketName() }));
      return true;
    } catch (e) {
      return false;
    }
  }

  public async bucketIsEmpty(): Promise<boolean> {
    const objects = await this.getObjectsByPrefixPaginated('', 1);
    return objects.length === 0;
  }


  /////////////////////////////////// OTHER ///////////////////////////////////


  private getClient(): S3Client {
    return new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: this.config.credentials,
      forcePathStyle: true // set the bucket name in the url (not in the domain)
    });
  }


  getBucketName(): string {
    return this.config.bucket;
  }



}
