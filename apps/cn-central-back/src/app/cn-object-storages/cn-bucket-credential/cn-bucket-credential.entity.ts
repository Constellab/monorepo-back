import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {CnCloudProvider} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnOrganization} from '../../cn-organizations/cn-organization.entity';

@Entity('bucket_credentials')
export class CnBucketCredentials extends CnBaseEntity {

  @Column({nullable: false, length: 50})
  name: string;

  @ManyToOne(() => CnCloudProvider, {nullable: false})
  cloudProvider: CnCloudProvider;

  @Column({nullable: false, length: 100})
  accessKeyId: string;

  @Column({nullable: false, length: 100})
  secretAccessKey: string;

  // might be associated to an organization
  @ManyToOne(() => CnOrganization, {nullable: true})
  organization: CnOrganization;
}
