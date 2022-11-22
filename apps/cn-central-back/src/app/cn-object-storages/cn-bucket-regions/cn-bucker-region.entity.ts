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

  @ManyToOne(() => CnCloudProvider, {nullable: false})
  cloudProvider: CnCloudProvider;

  @ManyToOne(() => CnCity, {nullable: false})
  city: CnCity;

  @Column({nullable: false, length: 10})
  technicalName: string;

  @Column({nullable: false, length: 255})
  endpoint: string;
}
