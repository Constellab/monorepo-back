import { BlTrim } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { CnCity } from '../../cn-city/cn-city.entity';
import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { CnCloudProvider } from '../cn-cloud-provider.entity';

export enum CnCloudProviderRegionType {
  ALL = 'ALL', // server and s3
  SERVER = 'SERVER',
  S3 = 'S3',
}

/**
 * Available regions for an object storage
 */
@Unique(['technicalName', 'cloudProvider', 'type'])
@Entity('cloud_provider_region')
export class CnCloudProviderRegion extends CnBaseEntity {
  @Type(() => CnCloudProvider)
  @ManyToOne(() => CnCloudProvider, { nullable: true, eager: true })
  cloudProvider!: CnCloudProvider | null;

  @ManyToOne(() => CnCity, { nullable: false, eager: true })
  city!: CnCity;

  @Column({ nullable: false, type: 'enum', enum: CnCloudProviderRegionType })
  type!: CnCloudProviderRegionType;

  @BlTrim()
  @Column({ nullable: false, length: 20 })
  technicalName!: string;

  @BlTrim()
  @Column({ nullable: false, length: 100 })
  name!: string;

  @BlTrim()
  @Column({ nullable: true, length: 255, type: 'varchar' })
  s3Endpoint!: string | null;

  supportsServer(): boolean {
    return this.type === CnCloudProviderRegionType.ALL || this.type === CnCloudProviderRegionType.SERVER;
  }

  supportsS3(): boolean {
    return this.type === CnCloudProviderRegionType.ALL || this.type === CnCloudProviderRegionType.S3;
  }
}
