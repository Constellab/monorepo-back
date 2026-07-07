import {
  BL_CLOUD_BUCKET_TYPES,
  BlAzureBlobContainerConfig,
  BlBucketConfig,
  BlBucketType,
  BlS3BucketConfig,
  BlTrim,
} from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

import { CnCloudProviderRegion } from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { CnLabEntity } from '../../cn-labs/cn-lab.entity';
import { CnBucketCredentials } from '../cn-bucket-credential/cn-bucket-credential.entity';

export enum CnBucketContentType {
  LAB_BACKUP = 'LAB_BACKUP',
  SPACE_IMAGE = 'SPACE_IMAGE',
  USER_IMAGE = 'USER_IMAGE',
  // Bucket containing all the file of a folder : notes, scenarios, message image, document.
  FOLDER = 'FOLDER',
}

/**
 * DTO to show the location of a bucket without telling the bucket name for security reason
 */
export interface CnBucketLocationDTO {
  bucketId: string;
  locationName: string;
  bucketType: BlBucketType;
  // only for cloud bucket
  cloudRegion?: CnCloudProviderRegion;
}

/**
 * Represent a bucket in an object storage
 */
@Entity('bucket')
export class CnBucket extends CnBaseEntity {
  // relation options to load required information for the bucket
  public static configRelation: FindOptionsRelations<CnBucket> = {
    region: { city: { country: true } },
    lab: true,
    credentials: true,
  };
  // default name for the lab bucket
  public static LAB_BUCKET_NAME = 'data-hub-storage';

  @Type(() => CnCloudProviderRegion)
  @ManyToOne(() => CnCloudProviderRegion, { nullable: true })
  region?: CnCloudProviderRegion;

  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, { nullable: true })
  lab?: CnLabEntity;

  @Type(() => CnBucketCredentials)
  @ManyToOne(() => CnBucketCredentials, { nullable: false })
  credentials: CnBucketCredentials;

  @BlTrim()
  @Column({ nullable: false, length: 100, update: false })
  name: string;

  @Column({ type: 'enum', nullable: false, enum: CnBucketContentType })
  contentType: CnBucketContentType;

  @Column({
    type: 'enum',
    enum: BlBucketType,
    nullable: false,
    default: BlBucketType.NORMAL,
  })
  bucketType: BlBucketType;

  public getBucketConfig(): BlBucketConfig {
    switch (this.bucketType) {
      case BlBucketType.NORMAL:
      case BlBucketType.LAB:
      case BlBucketType.GCP:
        return {
          type: this.bucketType,
          config: this.getS3BucketConfig(),
        };
      case BlBucketType.AZURE:
        return {
          type: this.bucketType,
          config: this.getAzureBlobConfig(),
        };
    }
  }

  private getS3BucketConfig(): BlS3BucketConfig {
    if (this.region == null && this.lab == null) {
      throw new Error('Nor the region or the lab was loaded');
    }

    if (this.isCloudBucket()) {
      if (this.region == null) {
        throw new Error('The region was not loaded');
      }
      return {
        endpoint: this.region.s3Endpoint,
        region: this.region.technicalName,
        bucket: this.name,
        credentials: {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
        },
        bucketType: this.bucketType,
      };
    } else {
      if (this.lab == null) {
        throw new Error('The lab was not loaded');
      }
      return {
        endpoint: this.lab.getS3ApiUrl(),
        region: 'lab',
        bucket: this.name,
        credentials: {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
        },
        bucketType: this.bucketType,
      };
    }
  }

  private getAzureBlobConfig(): BlAzureBlobContainerConfig {
    if (this.region == null) {
      throw new Error('The region was not loaded');
    }

    return {
      // for azure, we consider the access key id as the account name
      accountName: this.credentials.accessKeyId,
      containerName: this.name, // container name = bucket name
      accountKey: this.credentials.secretAccessKey,
      region: this.region.technicalName,
    };
  }

  getLocationName(): string {
    if (this.isCloudBucket()) {
      return this.region.name;
    } else {
      return this.lab.name;
    }
  }

  getBucketLocation(): CnBucketLocationDTO {
    return {
      bucketId: this.id,
      locationName: this.getLocationName(),
      bucketType: this.bucketType,
      cloudRegion: this.isCloudBucket() ? this.region : null,
    };
  }

  isCloudBucket(): boolean {
    return BL_CLOUD_BUCKET_TYPES.includes(this.bucketType);
  }

  isLabBucket(): boolean {
    return this.bucketType === BlBucketType.LAB;
  }
}
