import { BlLuxonDateColumn } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { TeRichTextInput } from '@monorepo/te-text-editor';
import { Exclude } from 'class-transformer';
import { DateTime } from 'luxon';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';

import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnBucket } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnHierarchyObjectInfo } from '../cn-hierarchy-objects/cn-hierarchy-object.dto';
import { CnHierarchyObjectType } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyRepresentation } from '../cn-hierarchy-objects/cn-hierarchy-representation';

@Entity('folder')
export class CnFolderEntity extends CnHierarchyRepresentation {
  public static ROOT_FOLDER_STYLE: CnTypeStyle = {
    icon_type: 'MATERIAL_ICON',
    icon_technical_name: 'folder_shared',
    background_color: 'accent',
    icon_color: 'accentContrast',
  };

  public static CHILD_FOLDER_STYLE: CnTypeStyle = {
    icon_type: 'MATERIAL_ICON',
    icon_technical_name: 'folder',
    background_color: 'accent',
    icon_color: 'accentContrast',
  };
  @Column({ nullable: false, length: 100 })
  name!: string;

  @Column({ nullable: true, length: 20 })
  code?: string;

  // this column is not selected by default
  @Exclude()
  @Column({ type: 'simple-json', nullable: true, select: false })
  description?: TeRichTextInput;

  @BlLuxonDateColumn({ nullable: true })
  startingDate?: DateTime;

  @BlLuxonDateColumn({ nullable: true })
  endingDate?: DateTime;

  // the storage is only provided in root folder
  @Exclude()
  @ManyToOne(() => CnBucket, { nullable: true })
  mainStorage?: CnBucket;

  @Exclude()
  @ManyToOne(() => CnBucket, { nullable: true })
  backupStorage?: CnBucket;

  @Column({ nullable: false, default: false })
  chatEnabled!: boolean;

  @Column({ nullable: false, type: 'simple-json' })
  style!: CnTypeStyle;

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

  getHierarchyObjectInfo(): CnHierarchyObjectInfo {
    return {
      objectType: CnHierarchyObjectType.FOLDER,
      name: this.name,
      user: this.lastModifiedBy ?? CnCurrentUserHelper.getAndCheckCurrentUser(),
      lastModifiedAt: this.lastModifiedAt ?? ClDateHelper.getDate(),
      style: this.style,
    };
  }
}

export type CnFolderWithHierarchy = Omit<CnFolderEntity, 'mainStorage' | 'backupStorage' | 'description'>;

export type CnFolder = Omit<CnFolderWithHierarchy, 'hierarchyRepresentation'>;

export type CnFolderWithStorage = Omit<CnFolderEntity, 'hierarchyRepresentation' | 'description'>;
