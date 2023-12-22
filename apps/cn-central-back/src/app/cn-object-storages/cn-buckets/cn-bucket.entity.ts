import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnBucketCredentials} from '../cn-bucket-credential/cn-bucket-credential.entity';
import {BlBucketConfig, BlBucketType} from '@monorepo/back-core-lib';
import {Type} from 'class-transformer';
import {FindOptionsRelations} from 'typeorm/find-options/FindOptionsRelations';
import {CnLabInstance} from '../../cn-lab-instances/cn-lab-instance.entity';

export enum CnBucketContentType {
  LAB_BACKUP = 'LAB_BACKUP',
  SPACE_IMAGE = 'SPACE_IMAGE',
  USER_IMAGE = 'USER_IMAGE',
  // Bucket containing all the file of a project : reports, experiments, comment image, document.
  PROJECT = 'PROJECT',
}

/**
 * DTO to show the location of a bucket without telling the bucket name for security reason
 */
export interface CnBucketLocationDTO {
  bucketId: string;
  locationName: string;
  bucketType: BlBucketType;
  cityName?: string;
  countryName?: string;
  cloudProviderName?: string;
}

/**
 * Represent a bucket in an object storage
 */
@Entity('bucket')
@Unique(['region', 'name'])
export class CnBucket extends CnBaseEntity {

  // relation options to load required information for the bucket
  public static configRelation: FindOptionsRelations<CnBucket> = {
    region: {city: {country: true}},
    labInstance: true,
    credentials: true
  };
  // default name for the lab bucket
  public static LAB_BUCKET_NAME = 'projects-storage';

  @Type(() => CnCloudProviderRegion)
  @ManyToOne(() => CnCloudProviderRegion, {nullable: true})
  region?: CnCloudProviderRegion;

  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, {nullable: true})
  labInstance?: CnLabInstance;

  @Type(() => CnBucketCredentials)
  @ManyToOne(() => CnBucketCredentials, {nullable: false})
  credentials: CnBucketCredentials;

  @Column({nullable: false, length: 100, update: false})
  name: string;

  @Column({nullable: false, length: 50})
  contentType: CnBucketContentType;

  @Column({
    type: 'enum', enum: BlBucketType, nullable: false,
    default: BlBucketType.NORMAL,
  })
  bucketType: BlBucketType;

  public getBucketConfig(): BlBucketConfig {
    if (this.region == null && this.labInstance == null) {
      throw new Error('Nor the region or the lab instance was loaded');
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
      if (this.labInstance == null) {
        throw new Error('The lab instance was not loaded');
      }
      return {
        endpoint: this.labInstance.getS3ApiUrl(),
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

  getLocationName(): string {
    if (this.isCloudBucket()) {
      return this.region.name;
    } else {
      return this.labInstance.name;
    }
  }

  getLocationCountryName(): string {
    if (this.isCloudBucket()) {
      return this.region.city.country.name;
    } else {
      return null;
    }
  }

  getLocationCityName(): string{
    if (this.isCloudBucket()) {
      return this.region.city.name;
    } else {
      return null;
    }
  }

  getLocationCloudProviderName(): string{
    if (this.isCloudBucket()) {
      return this.region.cloudProvider.name;
    } else {
      return null;
    }
  }

  getBucketLocation(): CnBucketLocationDTO {
    return {
      bucketId: this.id,
      locationName: this.getLocationName(),
      bucketType: this.bucketType,
      countryName: this.getLocationCountryName(),
      cityName: this.getLocationCityName(),
      cloudProviderName: this.getLocationCloudProviderName()
    };
  }

  isCloudBucket(): boolean {
    return this.bucketType === BlBucketType.NORMAL;
  }

  isLabBucket(): boolean {
    return this.bucketType === BlBucketType.LAB;
  }
}
