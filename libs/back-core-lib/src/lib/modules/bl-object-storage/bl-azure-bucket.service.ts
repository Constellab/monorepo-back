import { Logger } from '@nestjs/common';
import { BlAzureBlobContainerConfig, BlFileResponse, BlObject } from './bl-object-storage.class';
import {
  BlobClient,
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
import { BlObjectStorageInterface } from './bl-object-storage.interface';
import { BlBadRequestException } from '../../exceptions/bl-bad-request.exception';

export class BlAzureBucketService implements BlObjectStorageInterface {

  private readonly logger = new Logger(BlAzureBucketService.name);

  constructor(private config: BlAzureBlobContainerConfig) {
  }

  public async uploadObjectToBucket(obj: Buffer,
                                    objectName: string,
                                    contentType: string): Promise<string> {
    // Get a block blob client
    const blockBlobClient = this.getBlockBlobClient(objectName);

    // Upload data to the blob
    const uploadBlobResponse = await blockBlobClient.uploadData(obj as any, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });

    if (uploadBlobResponse.errorCode) {
      this.logger.error(`Error while uploading object ${objectName} to bucket ${this.getBucketName()}. Error ${uploadBlobResponse.errorCode}`);
      throw new BlBadRequestException('Error while uploading object');
    }

    // Return the URL of the uploaded blob
    return objectName;
  }

  //////////////////////////////////////////// DOWNLOAD OBJECT /////////////////////////////////////////

  async downloadObject(objectName: string): Promise<BlFileResponse> {
    // Get a block blob client
    const blobClient = this.getBlobClient(objectName);

    const downloadResponse = await blobClient.download();

    if (downloadResponse.errorCode) {
      this.logger.error(`Error while getting object ${objectName} from bucket ${this.getBucketName()}. Error ${downloadResponse.errorCode}`);
      throw new BlBadRequestException('Error while getting object');
    }

    if (!downloadResponse.readableStreamBody) {
      this.logger.error(`Error while getting object ${objectName} from bucket ${this.getBucketName()}. No readable stream`);
      throw new BlBadRequestException('Error while getting object');
    }

    return {
      name: objectName,
      file: downloadResponse.readableStreamBody,
      contentType: downloadResponse.contentType,
      contentLength: downloadResponse.contentLength
    };
  }


  //////////////////////////////////////////// GET OBJECTS /////////////////////////////////////////

  public async objectExist(objectName: string): Promise<boolean> {
    const blobClient = this.getBlobClient(objectName);

    return await blobClient.exists();
  }


  public async getObjectInfo(objectName: string): Promise<BlObject> {
    const blobClient = this.getBlobClient(objectName);

    let properties = await blobClient.getProperties();
    return {
      name: objectName,
      size: properties.contentLength
    };
  }


  public async getAllObjectsByPrefix(prefix: string = ''): Promise<BlObject[]> {
    const containerClient = this.getContainerClient();

    const objects: BlObject[] = [];

    const paginator = containerClient.listBlobsFlat({ prefix: prefix }).byPage({ maxPageSize: 100 });
    for await (const response of paginator) {
      for (const blob of response.segment.blobItems) {
        objects.push({
          name: blob.name,
          size: blob.properties.contentLength
        });
      }
    }

    return objects;
  }


  //////////////////////////////////////////// DELETE OBJECT /////////////////////////////////////////
  public async deleteObjectIfExists(objectName: string): Promise<boolean> {
    const blobClient = this.getBlobClient(objectName);

    const response = await blobClient.deleteIfExists();

    return response.succeeded;
  }


  public async deleteMultipleObjects(objectNames: string[]): Promise<void> {
    const containerClient = this.getContainerClient();

    for (const objectName of objectNames) {
      const blobClient = containerClient.getBlobClient(objectName);
      await blobClient.deleteIfExists();
    }
  }

  ////////////////////////////////////////// BUCKET //////////////////////////////////////////

  public async createBucket(): Promise<void> {
    const containerClient = this.getContainerClient();
    await containerClient.create();
  }

  public async deleteBucket(): Promise<void> {
    const containerClient = this.getContainerClient();
    await containerClient.delete();
  }

  public async bucketExists(): Promise<boolean> {
    const containerClient = this.getContainerClient();
    return await containerClient.exists();
  }

  public async bucketIsEmpty(): Promise<boolean> {
    const containerClient = this.getContainerClient();
    const iterable = await containerClient.listBlobsFlat().next();

    return iterable.done;
  }

  private getBlockBlobClient(objectName: string): BlockBlobClient {
    const containerClient = this.getContainerClient();

    return containerClient.getBlockBlobClient(objectName);
  }

  private getBlobClient(objectName: string): BlobClient {
    const containerClient = this.getContainerClient();

    return containerClient.getBlobClient(objectName);
  }

  private getContainerClient(): ContainerClient {
    const sharedKeyCredential = new StorageSharedKeyCredential(this.config.accountName, this.config.accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${this.config.accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    return blobServiceClient.getContainerClient(this.getBucketName());
  }

  getBucketName(): string {
    return this.config.containerName;
  }
}
