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
import { Exclude, Expose, Type } from 'class-transformer';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { DateTime } from 'luxon';
import { CnSpace, CnSpaceEntity } from '../../cn-spaces/cn-space.entity';
import { CnFolderUserEntity } from '../cn-folder-user/cn-folder-user.entity';
import { CnHierarchyObjectInfo } from './cn-hierarchy-object.dto';
import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';
import { CnHierarchyObjectTagEntity } from '../cn-hierarchy-object-tags/cn-hierarchy-object-tag.entity';
import { CnTag } from '../cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';
import { CnActivityEntityType } from '../../cn-activity/cn-activity.entity';
import { CnFrontService } from '../../cn-core/services/cn-front.service';

export enum CnHierarchyObjectType {
  FOLDER = 'FOLDER',
  DOCUMENT = 'DOCUMENT',
  CONSTELLAB_DOCUMENT = 'CONSTELLAB_DOCUMENT',
  HIDDEN_DOCUMENT = 'HIDDEN_DOCUMENT',
  NOTE = 'NOTE',
  SCENARIO = 'SCENARIO',
  RESOURCE = 'RESOURCE',
}

export enum CnHierarchyObjectVisibility {
  VISIBLE = 'VISIBLE', // Object is normally visible in the hierarchy
  TRASH = 'TRASH', // Object is in the bin and not visible by default
  HIDDEN = 'HIDDEN', // Object is never visible in the hierarchy
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
  parent: CnHierarchyObject;

  @Column({ nullable: true })
  parentId: string | null;

  // @Exclude()
  @ManyToOne(() => CnHierarchyObjectEntity, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  rootParent: CnHierarchyObject;

  @Column({ nullable: true })
  rootParentId: string | null;

  @TreeChildren()
  children: CnHierarchyObjectEntity[];

  @Exclude()
  @BlNotUpdatable()
  @ManyToOne(() => CnSpaceEntity, { nullable: false })
  space: CnSpace;

  @Column({ nullable: false, update: false })
  spaceId: string;

  @Exclude()
  @OneToMany(() => CnFolderUserEntity, (folderUser) => folderUser.rootFolder)
  users: CnFolderUserEntity[];

  @Column({ nullable: false, type: 'enum', enum: CnHierarchyObjectVisibility })
  visibility: CnHierarchyObjectVisibility;

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

  @Column({ nullable: false, type: 'simple-json' })
  style: CnTypeStyle;

  // column to store the last tags of the object
  // to avoid to make a request to load the tags
  // when we need to display the object list
  @Exclude()
  @Column({ nullable: true })
  lastTagsStr: string;

  @OneToMany(() => CnHierarchyObjectTagEntity, (tag: CnHierarchyObjectTagEntity) => tag.hierarchyObject)
  tags: CnHierarchyObjectTagEntity;

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
  public filterChildrenRecursively(
    filter: (hierarchyObject: CnHierarchyObjectWithChildren) => boolean
  ): this {
    this.children = this.children.filter(filter);
    this.children.forEach((child) => child.filterChildrenRecursively(filter));
    return this;
  }

  public flattenTreeRecursively(): CnHierarchyObjectWithChildren[] {
    const result: CnHierarchyObjectWithChildren[] = [];
    result.push(this);
    this.children.forEach((child) => {
      result.push(...child.flattenTreeRecursively());
    });
    return result;
  }

  public setObjectInfo(objectInfo: CnHierarchyObjectInfo): void {
    this.objectType = objectInfo.objectType;
    this.name = objectInfo.name;
    this.lastModifiedAt = objectInfo.lastModifiedAt;
    this.user = objectInfo.user;
    this.isValidated = objectInfo.isValidated;
    this.documentSize = objectInfo.documentSize;
    this.style = objectInfo.style;
  }

  public static newRootFolderHierarchy(
    space: CnSpace,
    objectInfo: CnHierarchyObjectInfo,
    tags?: CnTag[]
  ): CnHierarchyObjectEntity {
    const hierarchyObject = new CnHierarchyObjectEntity();
    hierarchyObject.space = space;
    hierarchyObject.spaceId = space.id;
    hierarchyObject.chatEnabled = false;
    hierarchyObject.hasDescription = false;
    hierarchyObject.visibility = CnHierarchyObjectVisibility.VISIBLE;
    hierarchyObject.setObjectInfo(objectInfo);

    if (tags) {
      hierarchyObject.setLastTags(tags);
    }

    return hierarchyObject;
  }

  public static newSubHierarchyObject(
    parentFolder: CnHierarchyObject,
    objectInfo: CnHierarchyObjectInfo,
    tags?: CnTag[]
  ): CnHierarchyObjectEntity {
    if (parentFolder.objectType !== CnHierarchyObjectType.FOLDER) {
      throw new Error('Parent object must be a folder');
    }
    const hierarchyObject = new CnHierarchyObjectEntity();
    hierarchyObject.spaceId = parentFolder.spaceId;
    hierarchyObject.parent = parentFolder as CnHierarchyObjectEntity;
    hierarchyObject.rootParentId = parentFolder.getRootFolderId();
    hierarchyObject.chatEnabled = false;
    hierarchyObject.hasDescription = false;
    hierarchyObject.visibility =
      objectInfo.objectType === CnHierarchyObjectType.HIDDEN_DOCUMENT
        ? CnHierarchyObjectVisibility.HIDDEN
        : CnHierarchyObjectVisibility.VISIBLE;
    hierarchyObject.setObjectInfo(objectInfo);

    if (tags) {
      hierarchyObject.setLastTags(tags);
    }

    return hierarchyObject;
  }

  public setLastTags(tags: CnTag[]): void {
    let lastTags = '';
    for (const tag of tags) {
      let strTag = `${tag.key}:${tag.value}`;
      if (lastTags.length > 0) {
        strTag = ',' + strTag;
      }
      if (lastTags.length + strTag.length > 255) {
        break;
      }
      lastTags += strTag;
    }

    this.lastTagsStr = lastTags;
  }

  @Expose()
  public get lastTags(): CnTag[] {
    if (!this.lastTagsStr) {
      return [];
    }
    return this.lastTagsStr.split(',').map((tag) => {
      const [key, value] = tag.split(':');
      return { key, value };
    });
  }

  public isFolder(): boolean {
    return this.objectType === CnHierarchyObjectType.FOLDER;
  }

  public getObjectTypeName(): string {
    switch (this.objectType) {
      case CnHierarchyObjectType.FOLDER:
        if (this.isRootFolder()) {
          return 'root folder';
        }
        return 'folder';
      case CnHierarchyObjectType.DOCUMENT:
      case CnHierarchyObjectType.HIDDEN_DOCUMENT:
        return 'document';
      case CnHierarchyObjectType.NOTE:
        return 'lab note';
      case CnHierarchyObjectType.SCENARIO:
        return 'scenario';
      case CnHierarchyObjectType.CONSTELLAB_DOCUMENT:
        return 'note';
      case CnHierarchyObjectType.RESOURCE:
        return 'resource';
    }
  }

  public getActivityEntityType(): CnActivityEntityType {
    switch (this.objectType) {
      case CnHierarchyObjectType.FOLDER:
        return CnActivityEntityType.FOLDER;
      case CnHierarchyObjectType.DOCUMENT:
      case CnHierarchyObjectType.HIDDEN_DOCUMENT:
      case CnHierarchyObjectType.CONSTELLAB_DOCUMENT:
        return CnActivityEntityType.DOCUMENT;
      case CnHierarchyObjectType.NOTE:
        return CnActivityEntityType.NOTE;
      case CnHierarchyObjectType.SCENARIO:
        return CnActivityEntityType.SCENARIO;
      case CnHierarchyObjectType.RESOURCE:
        return CnActivityEntityType.RESOURCE;
    }
  }

  public getFrontRoute(): string {
    switch (this.objectType) {
      case CnHierarchyObjectType.FOLDER:
        return CnFrontService.getFolderRoute(this.id);
      case CnHierarchyObjectType.CONSTELLAB_DOCUMENT:
        return CnFrontService.getConstellabDocRoute(this.id);
      case CnHierarchyObjectType.NOTE:
        return CnFrontService.getNoteRoute(this.id);
      case CnHierarchyObjectType.SCENARIO:
        return CnFrontService.getScenarioRoute(this.id);
      case CnHierarchyObjectType.HIDDEN_DOCUMENT:
      case CnHierarchyObjectType.DOCUMENT:
        return CnFrontService.getFolderRoute(this.parentId);
      case CnHierarchyObjectType.RESOURCE:
        return CnFrontService.getResourceRoute(this.id);
    }
  }
}

export type CnHierarchyObject = Omit<
  CnHierarchyObjectEntity,
  | 'children'
  | 'sortChildrenTree'
  | 'filterChildrenRecursively'
  | 'flattenTreeRecursively'
  | 'parent'
  | 'rootParent'
  | 'space'
  | 'tags'
>;

export type CnHierarchyObjectWithChildren = Omit<CnHierarchyObjectEntity, 'parent' | 'rootParent' | 'space'>;

export type CnHierarchyObjectWithParent = Omit<
  CnHierarchyObjectEntity,
  | 'children'
  | 'sortChildrenTree'
  | 'filterChildrenRecursively'
  | 'flattenTreeRecursively'
  | 'rootParent'
  | 'space'
  | 'tags'
>;
