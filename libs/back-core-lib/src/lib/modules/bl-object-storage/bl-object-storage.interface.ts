import { BlFileResponse, BlObject } from './bl-object-storage.class';

export interface BlObjectStorageInterface {

  uploadObjectToBucket(obj: Buffer, filename: string,
                       contentType: string, tags?: Record<string, string>): Promise<string>;

  //////////////////////////////////////////// DOWNLOAD OBJECT /////////////////////////////////////////

  downloadObject(objectName: string): Promise<BlFileResponse>;

  //////////////////////////////////////////// GET OBJECT /////////////////////////////////////////

  objectExist(objectName: string): Promise<boolean>;

  getObjectInfo(objectName: string): Promise<BlObject>;

  getAllObjectsByPrefix(prefix?: string): Promise<BlObject[]>;

  //////////////////////////////////////////// DELETE OBJECT /////////////////////////////////////////

  deleteObjectIfExists(objectName: string): Promise<boolean>;

  deleteMultipleObjects(objectNames: string[]): Promise<void>;

  //////////////////////////////////////////// BUCKET /////////////////////////////////////////
  createBucket(): Promise<void>;

  deleteBucket(): Promise<void>;

  bucketExists(): Promise<boolean>;

  bucketIsEmpty(): Promise<boolean>;

  //////////////////////////////////////////// TAGS /////////////////////////////////////////

  getObjectTags(objectName: string): Promise<Record<string, string>>;

  setObjectTags(objectName: string, tags: Record<string, string>): Promise<void>;

  //////////////////////////////////////////// OTHERS /////////////////////////////////////////
  getBucketName(): string;

}
