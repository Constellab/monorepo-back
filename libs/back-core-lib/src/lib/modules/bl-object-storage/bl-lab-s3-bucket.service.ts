import { Logger } from '@nestjs/common';
import { BlFileResponse, BlObject, BlS3BucketConfig } from './bl-object-storage.class';
import { lastValueFrom } from 'rxjs';
import { BlS3BucketService } from './bl-s3-bucket.service';
import { BlLabS3ServerNotAvailableException } from './bl-object-storage.exception';
import { BlExternalApiService } from '../bl-external-api/bl-external-api.service';
import { BlObjectStorageInterface } from './bl-object-storage.interface';
import { BlBadRequestException } from '../../exceptions/bl-bad-request.exception';


/**
 * Service to communicate with an S3 server of a lab (datahub).
 * It uses basic S3 commands to interact with the server.
 */
export class BlLabS3BucketService implements BlObjectStorageInterface {

  private readonly logger = new Logger(BlLabS3BucketService.name);

  private s3Service: BlS3BucketService;

  constructor(private config: BlS3BucketConfig, private apiService: BlExternalApiService) {
    this.s3Service = new BlS3BucketService(config);
  }

  async uploadObjectToBucket(obj: Buffer, filename: string,
                             contentType: string, tags?: Record<string, string>): Promise<string> {
    try {
      return await this.s3Service.uploadObjectToBucket(obj, filename, contentType, tags);
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  //////////////////////////////////////////// DOWNLOAD OBJECT /////////////////////////////////////////

  async downloadObject(objectName: string): Promise<BlFileResponse> {
    try {
      return await this.s3Service.downloadObject(objectName);
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  // //////////////////////////////////////////// GET OBJECT /////////////////////////////////////////
  async objectExist(objectName: string): Promise<boolean> {
    try {
      return this.s3Service.objectExist(objectName);
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  async getObjectInfo(objectName: string): Promise<BlObject> {
    try {
      return await this.s3Service.getObjectInfo(objectName);
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  async getAllObjectsByPrefix(prefix?: string): Promise<BlObject[]> {
    try {
      return await this.s3Service.getAllObjectsByPrefix(prefix);
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  //////////////////////////////////////////// DELETE OBJECT /////////////////////////////////////////

  async deleteObjectIfExists(objectName: string): Promise<boolean> {
    try {
      return await this.s3Service.deleteObjectIfExists(objectName);
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  async deleteMultipleObjects(objectNames: string[]): Promise<void> {
    try {
      return await this.s3Service.deleteMultipleObjects(objectNames);
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  //////////////////////////////////////////// BUCKET /////////////////////////////////////////
  async createBucket(): Promise<void> {
    try {
      return await this.s3Service.createBucket();
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  async deleteBucket(): Promise<void> {
    try {
      return await this.s3Service.deleteBucket();
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  async bucketExists(): Promise<boolean> {
    try {
      return await this.s3Service.bucketExists();
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  async bucketIsEmpty(): Promise<boolean> {
    try {
      return await this.s3Service.bucketIsEmpty();
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  getBucketName(): string {
    return this.s3Service.getBucketName();
  }


  //////////////////////////////////////////// TAGS /////////////////////////////////////////
  async getObjectTags(objectName: string): Promise<Record<string, string>> {
    try{
      return await this.s3Service.getObjectTags(objectName);
    } catch (error) {
      throw await this.handleError(error);
    }
  }

  async setObjectTags(objectName: string, tags: Record<string, string>): Promise<void> {
    try{
      return await this.s3Service.setObjectTags(objectName, tags);
    } catch (error) {
      throw await this.handleError(error);
    }
  }


  //////////////////////////////////////////// OTHERS /////////////////////////////////////////


  /**
   * Once an error occurred when check if this is because the lab is not available.
   * If the lab is not available, another is thrown, otherwise the original error is thrown.
   * @param e
   * @private
   */
  private async handleError(e: any): Promise<Error> {

    // endpoint = s3-server/v1, we need to remove the v1 to get the health check route
    const healthCheckEndpoint = this.config.endpoint.split('/').slice(0, -1).join('/');
    const route = healthCheckEndpoint + '/health-check';

    const result = await lastValueFrom(this.apiService.get(route,
      null, { logError: false, timeout: 2500 })).then(() => true).catch(() => false);

    if (!result) {
      this.logger.error(`Error during request to datahub. Error ${e}`);
      return new BlLabS3ServerNotAvailableException();
    }

    if(e.name !== 'internal_error' && e.message){
      this.logger.log(`Error during request to datahub. Error ${e.message}`);
      throw new BlBadRequestException(`Error during request to datahub. ${e.message}`);
    }else{
      const message = e.message ? e.message : e;
      this.logger.error(`Error during request to datahub. Error ${message}`);
      throw new BlBadRequestException("Error during request to datahub");
    }
  }
}
