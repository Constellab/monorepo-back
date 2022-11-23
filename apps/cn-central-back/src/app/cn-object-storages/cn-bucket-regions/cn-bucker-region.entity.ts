import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {CnCloudProvider} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnCity} from '../../cn-city/cn-city.entity';

/**
 * Available regions for an object storage
 */
@Unique(['technicalName', 'cloudProvider'])
@Entity('bucket_region')
export class CnBucketRegion extends CnBaseEntity {

  @ManyToOne(() => CnCloudProvider, {nullable: false, eager: true})
  cloudProvider: CnCloudProvider;

  @ManyToOne(() => CnCity, {nullable: false, eager: true})
  city: CnCity;

  @Column({nullable: false, length: 20})
  technicalName: string;

  @Column({nullable: false, length: 255})
  endpoint: string;
}
