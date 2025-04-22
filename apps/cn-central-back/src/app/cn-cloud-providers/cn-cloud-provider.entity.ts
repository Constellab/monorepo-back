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
}
