import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {CnBucketRegion} from '../cn-bucket-regions/cn-bucker-region.entity';
import {CnBucketCredentials} from '../cn-bucket-credential/cn-bucket-credential.entity';
import {CnOrganization} from '../../cn-organizations/cn-organization.entity';
import {BlBucketConfig, BlNotUpdatable} from '@monorepo/back-core-lib';
import {Type} from 'class-transformer';

export enum CnBucketContentType {
  LAB_BACKUP = 'LAB_BACKUP',
  ORGANIZATION_IMAGE = 'ORGANIZATION_IMAGE',
  USER_IMAGE = 'USER_IMAGE',
  REPORT_IMAGE = 'REPORT_IMAGE',
  REPORT_VIEW = 'REPORT_VIEW',
  COMMENT_IMAGE = 'COMMENT_IMAGE',
}

/**
 * Represent a bucket in an object storage
 */
@Entity('bucket')
export class CnBucket extends CnBaseEntity {

  @Type(() => CnBucketRegion)
  @ManyToOne(() => CnBucketRegion, {nullable: false})
  region: CnBucketRegion;

  @Type(() => CnBucketCredentials)
  @ManyToOne(() => CnBucketCredentials, {nullable: false})
  credentials: CnBucketCredentials;

  @Column({nullable: false, length: 100, update: false})
  name: string;

  // might be associated to an organization
  @Type(() => CnOrganization)
  @ManyToOne(() => CnOrganization, {nullable: true})
  @BlNotUpdatable()
  organization: CnOrganization;

  @Column({nullable: false, length: 50})
  contentType: CnBucketContentType;

  // if the bucket is associated to an object (like lab backup)
  @Column({nullable: true, length: 36})
  objectId: string;

  public getBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.region.endpoint,
      region: this.region.technicalName,
      bucket: this.name,
      credentials: {
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
      }
    };
  }
}
