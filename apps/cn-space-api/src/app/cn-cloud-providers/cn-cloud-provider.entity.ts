import { BlBucketType } from '@monorepo/back-core-lib';
import { Column, Entity, Unique } from 'typeorm';

import { CnBaseEntity } from '../cn-core/model/entities/cn-base.entity';

export type CnCloudProviderName = 'OVH' | 'AZURE' | 'OUTSCALE' | 'GCP';

/**
 * List the different cloud providers like AWS, OVH, GCP...
 */
@Unique(['name'])
@Entity('cloud_provider')
export class CnCloudProvider extends CnBaseEntity {
  @Column({ nullable: false, length: 50 })
  name: CnCloudProviderName;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  /**
   * return true if the cloud provided support native S3
   */
  public hasNativeS3(): boolean {
    return this.getS3BucketType() === BlBucketType.NORMAL;
  }

  public getS3BucketType(): BlBucketType {
    switch (this.name) {
      case 'AZURE':
        return BlBucketType.AZURE;
      case 'GCP':
        return BlBucketType.GCP;
      default:
        return BlBucketType.NORMAL;
    }
  }
}
