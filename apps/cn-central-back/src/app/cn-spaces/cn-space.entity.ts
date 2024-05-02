import {BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {ClDateHelper, ClStringHelper} from '@monorepo/core-lib';
import {Exclude, Type} from 'class-transformer';
import {CnBucket} from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import {FindOptionsRelations} from 'typeorm/find-options/FindOptionsRelations';

export enum CnSpaceType {
  // personal space create on the user creation (he cas invite other users in his space)
  PERSONAL = 'PERSONAL',
  // basic space created by a user
  BASIC = 'BASIC',
}


@Entity('space')
export class CnSpace extends CnBaseEntity {

  public static readonly DEFAULT_NB_LICENSES = 1;
  private static readonly DEFAULT_STORAGE_LIMIT = 1024 * 1024 * 1024; // 1GB


  // relation options to load required information for the bucket
  public static buckets: FindOptionsRelations<CnSpace> = {
    defaultProjectBucket: CnBucket.configRelation,
    defaultProjectBackupBucket: CnBucket.configRelation
  };

  @Column({nullable: false})
  name: string;

  @Column({nullable: true})
  photo: string;

  // front domain for this space
  @Column({length: 50, unique: true})
  domain: string;

  @Exclude({toPlainOnly: true})
  @Column({default: 0})
  nbLicenses: number;

  @Exclude({toPlainOnly: true})
  @Column({type: 'bigint'})
  cloudStorageLimit: number;

  @Exclude({toPlainOnly: true})
  @Column({type: 'bigint'})
  cloudStorageUsage: number;

  @Column({type: 'enum', enum: CnSpaceType, nullable: false, update: false})
  type: CnSpaceType;

  // default bucket region for this space
  @Exclude({toPlainOnly: true})
  // use by default for project bucket
  @Type(() => CnBucket)
  @ManyToOne(() => CnBucket, {nullable: false})
  defaultProjectBucket: CnBucket;

  // default bucket region for this space
  @Exclude({toPlainOnly: true})
  // use by default for project bucket
  @Type(() => CnBucket)
  @ManyToOne(() => CnBucket, {nullable: true})
  defaultProjectBackupBucket?: CnBucket;

  // don't set the createdBy and lastModifiedBy automatically
  // because this group it can be created on user signup (so no current user)
  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdAt = ClDateHelper.getDate();
    this.domain = ClStringHelper.generateUUID();
    this.cloudStorageLimit = CnSpace.DEFAULT_STORAGE_LIMIT;
    this.cloudStorageUsage = 0;
    this.nbLicenses = CnSpace.DEFAULT_NB_LICENSES;
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  public hasEnoughStorageForNewFile(fileSize: number): boolean {
    return this.cloudStorageUsage + fileSize <= this.cloudStorageLimit;
  }
}
