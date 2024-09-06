import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, Relation, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { Exclude, Type } from 'class-transformer';
import { CnUser } from '../../cn-users/cn-user.entity';
import { DateTime } from 'luxon';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnProjectUser } from '../cn-project-user/cn-project-user.entity';

export enum CnFolderObjectType {
  FOLDER = 'FOLDER',
  DOCUMENT = 'DOCUMENT',
  CONSTELLAB_DOCUMENT = 'CONSTELLAB_DOCUMENT',
  HIDDEN_DOCUMENT = 'HIDDEN_DOCUMENT',
  REPORT = 'REPORT',
  EXPERIMENT = 'EXPERIMENT',
}

@Entity('folder_hierarchy')
@Tree('materialized-path')
export class CnFolderHierarchyEntity extends BlEntityWithId {

  @Column({ nullable: false, length: 255 })
  name: string;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, { eager: true, nullable: false })
  user: Relation<CnUser>;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Column({
    nullable: false, update: false,
    type: 'enum', enum: CnFolderObjectType
  })
  objectType: CnFolderObjectType;

  @Column({ nullable: false, update: false })
  objectTypeOrder: number;

  // parent project of this project, can be null if this project is a project
  @TreeParent({ onDelete: 'RESTRICT' })
  parent: CnFolderHierarchyEntity;

  @Column({ nullable: true })
  parentId: string | null;

  @Exclude()
  @ManyToOne(() => CnFolderHierarchyEntity, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  rootParent: CnFolderHierarchyEntity;

  @Column({ nullable: true })
  rootParentId: string | null;

  @TreeChildren()
  children: CnFolderHierarchyEntity[];

  @Exclude()
  @BlNotUpdatable()
  @ManyToOne(() => CnSpace, { nullable: false })
  space: CnSpace;

  @Column({ nullable: false, update: false })
  spaceId: string;

  @Exclude()
  @OneToMany(() => CnProjectUser, projectUser => projectUser.rootFolder)
  users: CnProjectUser[];

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
    this.objectTypeOrder = this.objectType === CnFolderObjectType.FOLDER ? 1 : 2;
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
    this.children = this.children.filter(child => child.objectType === CnFolderObjectType.FOLDER);
    this.children.forEach(child => child.filterChildrenFolder());
    return this;
  }

  public static newRootFolderHierarchyEntity(objectType: CnFolderObjectType,
                                             title: string, user: CnUser,
                                             lastModifiedAt: DateTime,
                                             space: CnSpace): CnFolderHierarchyEntity {
    const folder = new CnFolderHierarchyEntity();
    folder.objectType = objectType;
    folder.name = title;
    folder.user = user;
    folder.space = space;
    folder.spaceId = space.id;
    folder.lastModifiedAt = lastModifiedAt;

    return folder;
  }

  public static newSubFolderHierarchyEntity(objectType: CnFolderObjectType,
                                            title: string, user: CnUser,
                                            lastModifiedAt: DateTime,
                                            parentFolder: CnFolderHierarchy): CnFolderHierarchyEntity {
    const folder = new CnFolderHierarchyEntity();
    folder.objectType = objectType;
    folder.name = title;
    folder.user = user;
    folder.spaceId = parentFolder.spaceId;
    folder.lastModifiedAt = lastModifiedAt;
    folder.parent = parentFolder as CnFolderHierarchyEntity;
    folder.rootParentId = parentFolder.getRootFolderId();

    return folder;
  }
}

export type CnFolderHierarchy = Omit<CnFolderHierarchyEntity,
  'children' | 'sortChildrenTree' | 'filterChildrenFolder' | 'parent' | 'rootParent' | 'space'>;

export type CnFolderHierarchyWithChildren = Omit<CnFolderHierarchyEntity,
  'parent' | 'rootParent' | 'space'>;
