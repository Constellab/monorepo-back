import { Column, Entity, ManyToOne } from 'typeorm';
import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { CnCloudProvider } from '../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { Exclude } from 'class-transformer';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { BlTrim } from '@monorepo/back-core-lib';

@Entity('bucket_credentials')
export class CnBucketCredentials extends CnBaseEntity {

  public static completeRelations: FindOptionsRelations<CnBucketCredentials> = {cloudProvider: true, space: true};

  @BlTrim()
  @Column({nullable: false, length: 50})
  name: string;

  @ManyToOne(() => CnCloudProvider, {nullable: true})
  cloudProvider?: CnCloudProvider;

  @BlTrim()
  @Exclude({toPlainOnly: true})
  @Column({nullable: false, length: 100})
  accessKeyId: string;

  @BlTrim()
  @Exclude({toPlainOnly: true})
  @Column({nullable: false, length: 100})
  secretAccessKey: string;

  // might be associated to a space
  @ManyToOne(() => CnSpace, {nullable: true})
  space: CnSpace;

  @Column({nullable: true})
  spaceId: string;

  @Column({nullable: true, length: 50})
  s3Username: string;

  @Column({nullable: true, length: 255})
  shortDescription: string;
}
