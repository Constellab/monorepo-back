import { BlTrim } from '@monorepo/back-core-lib';
import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

import { CnCloudProvider } from '../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { CnSpace, CnSpaceEntity } from '../../cn-spaces/cn-space.entity';

@Entity('bucket_credentials')
export class CnBucketCredentials extends CnBaseEntity {
  public static completeRelations: FindOptionsRelations<CnBucketCredentials> = {
    cloudProvider: true,
    space: true,
  };

  @BlTrim()
  @Column({ nullable: false, length: 50 })
  name!: string;

  @ManyToOne(() => CnCloudProvider, { nullable: true })
  cloudProvider!: CnCloudProvider | null;

  @BlTrim()
  @Exclude({ toPlainOnly: true })
  @Column({ nullable: false, length: 100 })
  accessKeyId!: string;

  @BlTrim()
  @Exclude({ toPlainOnly: true })
  @Column({ nullable: false, length: 100 })
  secretAccessKey!: string;

  // might be associated to a space
  @ManyToOne(() => CnSpaceEntity, { nullable: true })
  space!: CnSpace | null;

  @Column({ nullable: true, type: 'varchar', length: 36 })
  spaceId!: string | null;

  @Column({ nullable: true, type: 'varchar', length: 50 })
  s3Username!: string | null;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  shortDescription!: string | null;
}
