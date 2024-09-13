import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, Relation, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { Exclude, Type } from 'class-transformer';
import { CnUser } from '../../cn-users/cn-user.entity';
import { DateTime } from 'luxon';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnFolderUserEntity } from '../cn-folder-user/cn-folder-user.entity';

export enum CnHierarchyObjectType {
  FOLDER = 'FOLDER',
  DOCUMENT = 'DOCUMENT',
  CONSTELLAB_DOCUMENT = 'CONSTELLAB_DOCUMENT',
  HIDDEN_DOCUMENT = 'HIDDEN_DOCUMENT',
  REPORT = 'REPORT',
  EXPERIMENT = 'EXPERIMENT',
}

@Entity('hierarchy_object')
@Tree('materialized-path')
export class CnHierarchyObjectEntity extends BlEntityWithId {

  @Column({ nullable: false, length: 255 })
  name: string;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, { eager: true, nullable: false })
  user: Relation<CnUser>;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Column({
    nullable: false, update: false,
    type: 'enum', enum: CnHierarchyObjectType
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
  @OneToMany(() => CnFolderUserEntity, folderUser => folderUser.rootFolder)
  users: CnFolderUserEntity[];

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
   * For report or experiment only, if the object is validated
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
    this.children.forEach(child => child.sortChildrenTree());
    return this;
  }

  /**
   * Method to keep only children that are folders when children are loaded
   */
  public filterChildrenFolder(): this {
    this.children = this.children.filter(child => child.objectType === CnHierarchyObjectType.FOLDER);
    this.children.forEach(child => child.filterChildrenFolder());
    return this;
  }

  public static newRootFolderHierarchy(objectType: CnHierarchyObjectType,
                                       title: string, user: CnUser,
                                       lastModifiedAt: DateTime,
                                       space: CnSpace): CnHierarchyObjectEntity {
    const folder = new CnHierarchyObjectEntity();
    folder.objectType = objectType;
    folder.name = title;
    folder.user = user;
    folder.space = space;
    folder.spaceId = space.id;
    folder.lastModifiedAt = lastModifiedAt;

    return folder;
  }

  public static newSubHierarchyObject(objectType: CnHierarchyObjectType,
                                      title: string, user: CnUser,
                                      lastModifiedAt: DateTime,
                                      parentFolder: CnHierarchyObject): CnHierarchyObjectEntity {
    if(parentFolder.objectType !== CnHierarchyObjectType.FOLDER) {
      throw new Error('Parent object must be a folder');
    }
    const folder = new CnHierarchyObjectEntity();
    folder.objectType = objectType;
    folder.name = title;
    folder.user = user;
    folder.spaceId = parentFolder.spaceId;
    folder.lastModifiedAt = lastModifiedAt;
    folder.parent = parentFolder as CnHierarchyObjectEntity;
    folder.rootParentId = parentFolder.getRootFolderId();

    return folder;
  }
}

export type CnHierarchyObject = Omit<CnHierarchyObjectEntity,
  'children' | 'sortChildrenTree' | 'filterChildrenFolder' | 'parent' | 'rootParent' | 'space'>;

export type CnHierarchyObjectWithChildren = Omit<CnHierarchyObjectEntity,
  'parent' | 'rootParent' | 'space'>;
