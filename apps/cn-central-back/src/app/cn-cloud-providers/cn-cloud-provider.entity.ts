import {Column, Entity, Unique} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';

export enum CnCloudProviderName {
  OVH = 'OVH',
}

/**
 * List the different cloud providers like AWS, OVH, GCP...
 */
@Unique(['name'])
@Entity('cloud_provider')
export class CnCloudProvider extends CnBaseEntity{

  @Column({type: 'enum', nullable: false, enum: CnCloudProviderName})
  name: CnCloudProviderName;
}
