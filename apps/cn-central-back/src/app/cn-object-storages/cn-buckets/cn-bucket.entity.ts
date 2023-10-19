import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnBucketCredentials} from '../cn-bucket-credential/cn-bucket-credential.entity';
import {BlBucketConfig} from '@monorepo/back-core-lib';
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

  // can be used info to describe the bucket
  @Column({nullable: true, length: 50})
  additionalInfo: string;

  public getBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.region.s3Endpoint,
      region: this.region.technicalName,
      bucket: this.name,
      credentials: {
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
      }
    };
  }
}
