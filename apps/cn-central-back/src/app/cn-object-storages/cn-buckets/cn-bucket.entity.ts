import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnBucketCredentials} from '../cn-bucket-credential/cn-bucket-credential.entity';
import {BlBucketConfig, BlBucketType} from '@monorepo/back-core-lib';
import {Type} from 'class-transformer';
import {FindOptionsRelations} from 'typeorm/find-options/FindOptionsRelations';

export enum CnBucketContentType {
  LAB_BACKUP = 'LAB_BACKUP',
  SPACE_IMAGE = 'SPACE_IMAGE',
  USER_IMAGE = 'USER_IMAGE',
  // Bucket containing all the file of a project : reports, experiments, comment image, document.
  PROJECT = 'PROJECT',
}

/**
 * Represent a bucket in an object storage
 */
@Entity('bucket')
@Unique(['region', 'name'])
export class CnBucket extends CnBaseEntity {

  // relation options to load required information for the bucket
  public static configRelation: FindOptionsRelations<CnBucket> = {region: true, credentials: true};
  // default name for the lab bucket
  public static LAB_BUCKET_NAME = 'projects-storage';

  @Type(() => CnCloudProviderRegion)
  @ManyToOne(() => CnCloudProviderRegion, {nullable: false})
  region: CnCloudProviderRegion;

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
  }
}
