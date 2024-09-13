import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, Relation } from 'typeorm';
import { Exclude, Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { BlLuxonDateColumn, BlRichTextContent } from '@monorepo/back-core-lib';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnBucket } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnHierarchyRepresentation } from '../cn_hierarchy_objects/cn-hierarchy-representation';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';
import { CnHierarchyObjectInfo } from '../cn_hierarchy_objects/cn-hierarchy-object.dto';


@Entity('folder')
export class CnFolderEntity extends CnHierarchyRepresentation {

  @Column({ nullable: false, length: 100 })
  title: string;

  @Column({ nullable: true, length: 20 })
  code: string;

  // this column is not selected by default
  @Exclude()
  @Column({ type: 'simple-json', nullable: true, select: false })
  description: BlRichTextContent;

  @BlLuxonDateColumn({ nullable: true })
  startingDate: DateTime;

  @BlLuxonDateColumn({ nullable: true })
  endingDate: DateTime;

  // TODO A voir si on garde
  @Type(() => CnUser)
  @ManyToOne(() => CnUser, { eager: true, nullable: false })
  leader: Relation<CnUser>;

  @Exclude()
  @ManyToOne(() => CnBucket, { nullable: false })
  mainStorage: CnBucket;

  @Exclude()
  @ManyToOne(() => CnBucket, { nullable: false })
  backupStorage: CnBucket;

  @Column({ nullable: false, default: false })
  chatEnabled: boolean;

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  getFolderObjectInfo(): CnHierarchyObjectInfo {
    return {
      name: this.title,
      user: this.leader,
      lastModifiedAt: this.lastModifiedAt,
    };
  }
}

export type CnFolderWithHierarchy = Omit<CnFolderEntity, 'mainStorage' | 'backupStorage' | 'description'>;

export type CnFolder = Omit<CnFolderWithHierarchy, 'hierarchyRepresentation'>;

export type CnFolderWithStorage = Omit<CnFolderEntity, 'hierarchyRepresentation' | 'description'>;
