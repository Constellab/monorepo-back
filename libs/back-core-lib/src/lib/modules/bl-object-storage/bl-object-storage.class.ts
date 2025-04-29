import { Stream } from 'stream';

export enum BlBucketType {
  NORMAL = 'NORMAL',
  LAB = 'LAB', // bucket hosted on a lab
  AZURE = 'AZURE', // azure blob storage
  GCP = 'GCP', // gcp bucket
}

export const blCloudBucketTypes: BlBucketType[] = [BlBucketType.NORMAL, BlBucketType.AZURE, BlBucketType.GCP];

/**
 * Object that represent a S3 or Azure bucket config
 */
export type BlBucketConfig =
  | {
      type: BlBucketType.NORMAL | BlBucketType.LAB | BlBucketType.GCP;
      config: BlS3BucketConfig;
    }
  | {
      type: BlBucketType.AZURE;
      config: BlAzureBlobContainerConfig;
    };

export interface BlS3BucketConfig {
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

export interface BlAzureBlobContainerConfig {
  accountName: string;
  containerName: string;
  accountKey: string;
  region: string;
}

export interface BlObjectStorageObjectsInfo {
  totalSize: number;
  nbObjects: number;
}

export interface BlObject {
  name: string;
  size: number;
}

export interface BlFileResponse {
  name: string;
  file: Stream;
  contentType: string;
  contentLength: number;
}
