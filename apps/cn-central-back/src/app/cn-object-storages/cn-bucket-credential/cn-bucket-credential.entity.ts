import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {CnCloudProvider} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnOrganization} from '../../cn-organizations/cn-organization.entity';
import {Exclude} from 'class-transformer';

@Entity('bucket_credentials')
export class CnBucketCredentials extends CnBaseEntity {

  @Column({nullable: false, length: 50})
  name: string;

  @ManyToOne(() => CnCloudProvider, {nullable: false})
  cloudProvider: CnCloudProvider;

  @Exclude({toPlainOnly: true})
  @Column({nullable: false, length: 100})
  accessKeyId: string;

  @Exclude({toPlainOnly: true})
  @Column({nullable: false, length: 100})
  secretAccessKey: string;

  // might be associated to an organization
  @ManyToOne(() => CnOrganization, {nullable: true})
  organization: CnOrganization;
}
