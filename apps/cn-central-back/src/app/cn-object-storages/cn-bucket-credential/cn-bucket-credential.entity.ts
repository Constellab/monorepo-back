import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {CnCloudProvider} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnSpace} from '../../cn-spaces/cn-space.entity';
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

  // might be associated to a space
  @ManyToOne(() => CnSpace, {nullable: true})
  space: CnSpace;

  @Column({nullable: true, length: 50})
  s3Username: string;

  @Column({nullable: true, length: 255})
  shortDescription: string;
}
