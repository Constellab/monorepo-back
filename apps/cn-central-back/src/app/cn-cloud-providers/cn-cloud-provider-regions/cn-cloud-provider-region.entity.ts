import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {CnCloudProvider} from '../cn-cloud-provider.entity';
import {CnCity} from '../../cn-city/cn-city.entity';

export enum CnCloudProviderRegionType {
  SERVER = 'SERVER',
  S3 = 'S3',
}

/**
 * Available regions for an object storage
 */
@Unique(['technicalName', 'cloudProvider', 'type'])
@Entity('cloud_provider_region')
export class CnCloudProviderRegion extends CnBaseEntity {

  @ManyToOne(() => CnCloudProvider, {nullable: true, eager: true})
  cloudProvider: CnCloudProvider;

  @ManyToOne(() => CnCity, {nullable: false, eager: true})
  city: CnCity;

  @Column({nullable: false, type: 'enum', enum: CnCloudProviderRegionType})
  type: CnCloudProviderRegionType;

  @Column({nullable: false, length: 20})
  technicalName: string;

  @Column({nullable: false, length: 100})
  name: string;

  @Column({nullable: true, length: 255})
  s3Endpoint: string;
}
