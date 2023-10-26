import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {CnCloudProvider} from '../cn-cloud-provider.entity';
import {CnCity} from '../../cn-city/cn-city.entity';
import {CnSpace} from '../../cn-spaces/cn-space.entity';

/**
 * Available regions for an object storage
 */
@Unique(['technicalName', 'cloudProvider'])
@Entity('cloud_provider_region')
export class CnCloudProviderRegion extends CnBaseEntity {

  @ManyToOne(() => CnCloudProvider, {nullable: true, eager: true})
  cloudProvider?: CnCloudProvider;

  @ManyToOne(() => CnCity, {nullable: false, eager: true})
  city: CnCity;

  @Column({nullable: false, length: 20})
  technicalName: string;

  @Column({nullable: true, length: 255})
  s3Endpoint: string;

  @ManyToOne(() => CnSpace, {nullable: true, eager: true})
  space?: CnSpace;

  @Column({nullable: true})
  spaceId: string;

  isOnPremise(): boolean{
    return this.cloudProvider == null;
  }

  isCloud(): boolean{
    return this.cloudProvider != null;
  }
}
