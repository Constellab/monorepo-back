import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Relation,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { Exclude, Type } from 'class-transformer';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { DateTime } from 'luxon';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnFolderUserEntity } from '../cn-folder-user/cn-folder-user.entity';
import { CnHierarchyObjectInfo } from './cn-hierarchy-object.dto';

export enum CnHierarchyObjectType {
  FOLDER = 'FOLDER',
  DOCUMENT = 'DOCUMENT',
  CONSTELLAB_DOCUMENT = 'CONSTELLAB_DOCUMENT',
  HIDDEN_DOCUMENT = 'HIDDEN_DOCUMENT',
  NOTE = 'NOTE',
  SCENARIO = 'SCENARIO',
}

@Entity('hierarchy_object')
@Tree('materialized-path')
export class CnHierarchyObjectEntity extends BlEntityWithId {
  @Column({ nullable: false, length: 255 })
  name: string;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  user: Relation<CnUser>;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Column({
    nullable: false,
    type: 'enum',
    enum: CnHierarchyObjectType,
  })
  objectType: CnHierarchyObjectType;

  @Column({ nullable: false, update: false })
  objectTypeOrder: number;

  // parent folder of this folder, can be null if this folder is a folder
  @TreeParent({ onDelete: 'RESTRICT' })
  parent: CnHierarchyObjectEntity;

  @Column({ nullable: true })
  parentId: string | null;

  @Exclude()
  @ManyToOne(() => CnHierarchyObjectEntity, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  rootParent: CnHierarchyObjectEntity;

  @Column({ nullable: true })
  rootParentId: string | null;

  @TreeChildren()
  children: CnHierarchyObjectEntity[];

  @Exclude()
  @BlNotUpdatable()
  @ManyToOne(() => CnSpace, { nullable: false })
  space: CnSpace;

  @Column({ nullable: false, update: false })
  spaceId: string;

  @Exclude()
  @OneToMany(() => CnFolderUserEntity, (folderUser) => folderUser.rootFolder)
  users: CnFolderUserEntity[];

  /**
   * If we show the object in the hierarchy
   */
  @Column({ nullable: false, default: true })
  isVisible: boolean;

  /**
   * For folder only, if chat is enabled
   */
  @Column({ nullable: false, default: false })
  chatEnabled: boolean;

  /**
   * For folder only, if description is written
   */
  @Column({ nullable: false, default: false })
  hasDescription: boolean;

  /**
   * For note or scenario only, if the object is validated
   */
  @Column({ nullable: false, default: false })
  isValidated: boolean;

  @Column({ nullable: true, type: 'bigint' })
  documentSize: number;

  @BeforeInsert()
  setObjectTypeOrder(): void {
    this.objectTypeOrder = this.objectType === CnHierarchyObjectType.FOLDER ? 1 : 2;
  }

  public getRootFolderId(): string {
    if (this.parentId === null) {
      return this.id;
    }
    return this.rootParentId;
  }

  public isRootFolder(): boolean {
    return this.parentId === null;
  }

  public sortChildrenTree(): this {
    this.children.sort((a, b) => a.name.localeCompare(b.name));
    this.children.forEach((child) => child.sortChildrenTree());
    return this;
  }

  /**
   * Method to keep only children that are folders when children are loaded
   */
  public filterChildrenFolder(): this {
    this.children = this.children.filter((child) => child.objectType === CnHierarchyObjectType.FOLDER);
    this.children.forEach((child) => child.filterChildrenFolder());
    return this;
  }

  public setObjectInfo(objectInfo: CnHierarchyObjectInfo): void {
    this.objectType = objectInfo.objectType;
    this.name = objectInfo.name;
    this.lastModifiedAt = objectInfo.lastModifiedAt;
    this.user = objectInfo.user;
    this.isValidated = objectInfo.isValidated;
    this.documentSize = objectInfo.documentSize;
    this.isVisible = objectInfo.isVisible;
  }

  public static newRootFolderHierarchy(
    space: CnSpace,
    objectInfo: CnHierarchyObjectInfo
  ): CnHierarchyObjectEntity {
    const folder = new CnHierarchyObjectEntity();
    folder.space = space;
    folder.spaceId = space.id;
    folder.chatEnabled = false;
    folder.hasDescription = false;
    folder.setObjectInfo(objectInfo);

    return folder;
  }

  public static newSubHierarchyObject(
    parentFolder: CnHierarchyObject,
    objectInfo: CnHierarchyObjectInfo
  ): CnHierarchyObjectEntity {
    if (parentFolder.objectType !== CnHierarchyObjectType.FOLDER) {
      throw new Error('Parent object must be a folder');
    }
    const folder = new CnHierarchyObjectEntity();
    folder.spaceId = parentFolder.spaceId;
    folder.parent = parentFolder as CnHierarchyObjectEntity;
    folder.rootParentId = parentFolder.getRootFolderId();
    folder.chatEnabled = false;
    folder.hasDescription = false;
    folder.setObjectInfo(objectInfo);

    return folder;
  }
}

export type CnHierarchyObject = Omit<
  CnHierarchyObjectEntity,
  'children' | 'sortChildrenTree' | 'filterChildrenFolder' | 'parent' | 'rootParent' | 'space'
>;

export type CnHierarchyObjectWithChildren = Omit<CnHierarchyObjectEntity, 'parent' | 'rootParent' | 'space'>;
