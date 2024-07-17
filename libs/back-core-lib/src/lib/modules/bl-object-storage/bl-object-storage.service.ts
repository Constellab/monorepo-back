import { Injectable } from '@nestjs/common';
import { ClHelpService, ClStringHelper } from '@monorepo/core-lib';
import { BlFileHelper } from '../../utils/bl-file-helper';
import { BlFile } from '../../models/bl-file.class';
import { BlBucketConfig, BlFileResponse, BlObject, BlObjectStorageObjectsInfo } from './bl-object-storage.class';
import { BlAzureBucketService } from './bl-azure-bucket.service';
import { BlObjectStorageInterface } from './bl-object-storage.interface';
import { BlS3BucketService } from './bl-s3-bucket.service';
import { BlExternalApiService } from '../bl-external-api/bl-external-api.service';
import { BlLabS3BucketService } from './bl-lab-s3-bucket.service';


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

  constructor(private apiService: BlExternalApiService) {
  }

  //////////////////////////////////////////// UPLOAD OBJECT /////////////////////////////////////////

  public async uploadObject(config: BlBucketConfig | BlBucketConfig[], obj: BlFile,
                            options: BlObjectStorageUploadOptions = {}): Promise<string> {
    const filename = this.getFilename(options, BlFileHelper.getFileExtension(obj.originalname), obj.originalname);

    return this.uploadObjectToBuckets(config, obj.buffer, filename, obj.mimetype);
  }


  public async uploadJson(config: BlBucketConfig | BlBucketConfig[], json: any,
                          options: BlObjectStorageUploadOptions = {}): Promise<string> {
    const filename = this.getFilename(options, 'json');

    const buffer = Buffer.from(JSON.stringify(json));
    return this.uploadObjectToBuckets(config, buffer, filename, 'application/json');
  }

  private async uploadObjectToBuckets(bucketConfigs: BlBucketConfig | BlBucketConfig[], obj: Buffer, filename: string,
                                      contentType: string): Promise<string> {
    const configs: BlBucketConfig[] = ClHelpService.convertObjectOrArrayToArray(bucketConfigs);

    const promises = configs.map((conf) =>
      this.uploadObjectToBucket(conf, obj, filename, contentType));
    await Promise.all(promises);

    return filename;
  }

  private async uploadObjectToBucket(config: BlBucketConfig, obj: Buffer, filename: string,
                                     contentType: string): Promise<string> {

    const service = this.getService(config);

    return service.uploadObjectToBucket(obj, filename, contentType);
  }

  //////////////////////////////////////////// DOWNLOAD OBJECT /////////////////////////////////////////

  public async downloadObject(config: BlBucketConfig, objectName: string): Promise<BlFileResponse> {
    const service = this.getService(config);

    return service.downloadObject(objectName);
  }

  //////////////////////////////////////////// GET OBJECT /////////////////////////////////////////


  public async getAllObjectsByPrefix(config: BlBucketConfig, prefix: string = ''): Promise<BlObject[]> {
    const service = this.getService(config);

    return service.getAllObjectsByPrefix(prefix);
  }

  public getObjectInfo(config: BlBucketConfig, objectName: string): Promise<BlObject> {
    const service = this.getService(config);

    return service.getObjectInfo(objectName);
  }

  public async objectExist(config: BlBucketConfig, objectName: string): Promise<boolean> {
    const service = this.getService(config);

    return service.objectExist(objectName);
  }

  public getObjectAsJson(config: BlBucketConfig, objectName: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.downloadObject(config, objectName)
        .then((message) => {
          let body = '';
          message.file.on('data', (chunk) => {
            body += chunk;
          });
          message.file.on('end', () => {
            resolve(JSON.parse(body));
          });
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  public async getObjectsSizeByPrefix(config: BlBucketConfig, prefix: string = ''): Promise<BlObjectStorageObjectsInfo> {
    const objects = await this.getAllObjectsByPrefix(config, prefix);
    const result: BlObjectStorageObjectsInfo = { totalSize: 0, nbObjects: objects.length };

    for (const object of objects) {
      result.totalSize += object.size;
    }

    return result;
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
      const service = this.getService(bucketConfig);
      promises.push(service.deleteObjectIfExists(objectName));
    }

    const results = await Promise.all(promises);
    return results.some((res) => res);
  }


  public async deleteObjectsByPrefix(config: BlBucketConfig | BlBucketConfig[], prefix: string): Promise<void> {
    const bucketConfigs = ClHelpService.convertObjectOrArrayToArray(config);

    const promises: Promise<void>[] = [];

    for (const bucketConfig of bucketConfigs) {
      const service = this.getService(bucketConfig);
      const objects = await service.getAllObjectsByPrefix(prefix);
      promises.push(service.deleteMultipleObjects(objects.map((obj) => obj.name)));
    }

    await Promise.all(promises);
  }


  public async deleteMultipleObjects(config: BlBucketConfig | BlBucketConfig[], objectNames: string[]): Promise<void> {
    if (ClHelpService.isNullOrEmpty(objectNames)) return;

    const bucketConfigs = ClHelpService.convertObjectOrArrayToArray(config);

    const promises: Promise<void>[] = [];

    for (const bucketConfig of bucketConfigs) {
      const service = this.getService(bucketConfig);
      promises.push(service.deleteMultipleObjects(objectNames));
    }

    await Promise.all(promises);
  }


  ////////////////////////////////////////// BUCKET //////////////////////////////////////////

  public async createBucket(config: BlBucketConfig): Promise<void> {
    const service = this.getService(config);
    return service.createBucket();
  }

  /**
   *
   * @param config bucket config
   * @param errorIfNotExist if true throw an error if the bucket does not exist
   * @param force if true delete the bucket even if it is not empty
   */
  public async deleteBucket(config: BlBucketConfig, errorIfNotExist: boolean = true,
                            force: boolean = false): Promise<void> {
    const service = this.getService(config);

    if (!await service.bucketExists()) {
      if (errorIfNotExist) {
        throw new Error(`The bucket '${service.getBucketName()}' does not exist`);
      } else {
        return;
      }
    }

    if (!(await service.bucketIsEmpty()) && !force) {
      throw new Error(`The bucket '${service.getBucketName()}' is not empty`);
    }

    return service.deleteBucket();
  }

  public async bucketExist(config: BlBucketConfig): Promise<boolean> {
    const service = this.getService(config);
    return service.bucketExists();
  }

  public async bucketIsEmpty(config: BlBucketConfig): Promise<boolean> {
    const service = this.getService(config);
    return service.bucketIsEmpty();
  }

  /////////////////////////////////// OTHER ///////////////////////////////////


  private getService(config: BlBucketConfig): BlObjectStorageInterface {
    if (config.type === 'azureBlob') {
      return new BlAzureBucketService(config.config);
    } else if (config.type === 'lab') {
      return new BlLabS3BucketService(config.config, this.apiService);
    } else {
      return new BlS3BucketService(config.config);
    }
  }

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
