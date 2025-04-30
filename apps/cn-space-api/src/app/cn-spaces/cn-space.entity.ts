import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { CnBaseEntity } from '../cn-core/model/entities/cn-base.entity';
import { ClDateHelper, ClStringHelper } from '@monorepo/core-lib';
import { Exclude, Type } from 'class-transformer';
import { CnBucket } from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

export enum CnSpaceType {
  // personal space create on the user creation (he cas invite other users in his space)
  PERSONAL = 'PERSONAL',
  // entreprise space created by a user
  ENTREPRISE = 'ENTREPRISE',
}

@Entity('space')
export class CnSpaceEntity extends CnBaseEntity {
  private static readonly DEFAULT_STORAGE_LIMIT = 1024 * 1024 * 1024; // 1GB
  public static readonly PERSONAL_SPACE_USER_LIMIT = 3;

  // relation options to load required information for the bucket
  public static buckets: FindOptionsRelations<CnSpaceEntity> = {
    defaultFolderBucket: CnBucket.configRelation,
    defaultFolderBackupBucket: CnBucket.configRelation,
  };

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  photo: string;

  // front domain for this space
  @Column({ length: 50, unique: true })
  domain: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'bigint' })
  cloudStorageLimit: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'bigint' })
  cloudStorageUsage: number;

  @Column({ type: 'enum', enum: CnSpaceType, nullable: false, update: false })
  type: CnSpaceType;

  // default bucket region for this space
  @Exclude({ toPlainOnly: true })
  // use by default for folder bucket
  @Type(() => CnBucket)
  @ManyToOne(() => CnBucket, { nullable: false })
  defaultFolderBucket: CnBucket;

  // default bucket region for this space
  @Exclude({ toPlainOnly: true })
  // use by default for folder bucket
  @Type(() => CnBucket)
  @ManyToOne(() => CnBucket, { nullable: true })
  defaultFolderBackupBucket?: CnBucket;

  // don't set the createdBy and lastModifiedBy automatically
  // because this group it can be created on user signup (so no current user)
  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdAt = ClDateHelper.getDate();
    this.domain = ClStringHelper.generateUUID();
    this.cloudStorageLimit = CnSpaceEntity.DEFAULT_STORAGE_LIMIT;
    this.cloudStorageUsage = 0;
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  public hasEnoughStorageForNewFile(fileSize: number): boolean {
    return this.cloudStorageUsage + fileSize <= this.cloudStorageLimit;
  }

  public isEntrepriseSpace(): boolean {
    return this.type === CnSpaceType.ENTREPRISE;
  }

  public isPersonalSpace(): boolean {
    return this.type === CnSpaceType.PERSONAL;
  }
}

export type CnSpace = Omit<CnSpaceEntity, 'defaultFolderBucket' | 'defaultFolderBackupBucket'>;
