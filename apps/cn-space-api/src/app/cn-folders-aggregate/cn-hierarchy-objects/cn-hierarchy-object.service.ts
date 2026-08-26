import {
  BlAbstractService,
  BlBadRequestException,
  BlSearchBuilder,
  BlSearchParams,
} from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, TreeRepository } from 'typeorm';

import { CnTag } from '../cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
  CnHierarchyObjectType,
  CnHierarchyObjectVisibility,
  CnHierarchyObjectWithChildren,
  CnHierarchyObjectWithParent,
} from './cn-hierarchy-object.entity';
import { CnHierarchyObjectSearchBuilder } from './cn-hierarchy-object-search-builder';

/** The root folders a search runs over, and whose objects it is allowed to see. */
export interface CnRootFoldersSearchScope {
  rootFoldersIds: string[];
  spaceId: string;
  visibility: CnHierarchyObjectVisibility;
}

@Injectable()
export class CnHierarchyObjectService extends BlAbstractService<CnHierarchyObjectEntity> {
  constructor(
    @InjectRepository(CnHierarchyObjectEntity)
    private readonly repository: TreeRepository<CnHierarchyObjectEntity>
  ) {
    super(repository, CnHierarchyObjectEntity);
  }

  public async getRootFolder(folder: CnHierarchyObject): Promise<CnHierarchyObject> {
    if (folder.isRootFolder()) {
      return folder;
    }
    return this.findByIdAndCheck(folder.getRootFolderId());
  }

  /**
   * Return a simplified list from this folder to the root folder
   */
  public async getAncestors(folder: CnHierarchyObject): Promise<CnHierarchyObject[]> {
    const parent = await this.repository.findAncestorsTree(folder as CnHierarchyObjectEntity, {
      relations: ['user'],
    });
    const folders: CnHierarchyObject[] = [];
    let currentFolder = parent;
    while (currentFolder != null) {
      folders.push(currentFolder);
      currentFolder = currentFolder.parent as CnHierarchyObjectEntity;
    }
    return folders;
  }

  public async getAncestorsByFolderId(folderId: string): Promise<CnHierarchyObject[]> {
    const folder = await this.findByIdAndCheck(folderId);

    return this.getAncestors(folder);
  }

  /**
   * Get the folder tree from the root folder, only return the node of type folder and visible
   * @param folder
   */
  public async getFolderTree(folder: CnHierarchyObject): Promise<CnHierarchyObjectWithChildren> {
    const folderTree = await this.getObjectTree(folder);

    return folderTree.filterChildrenRecursively(
      (child) =>
        child.objectType === CnHierarchyObjectType.FOLDER &&
        child.visibility === CnHierarchyObjectVisibility.VISIBLE
    );
  }

  public async getObjectTree(hierarchyObject: CnHierarchyObject): Promise<CnHierarchyObjectWithChildren> {
    const folderTree = await this.repository.findDescendantsTree(hierarchyObject as CnHierarchyObjectEntity);

    return folderTree.sortChildrenTree();
  }

  public async getChildrenFolder(parentFolderId: string): Promise<CnHierarchyObject[]> {
    return this.repository.find({
      where: {
        parentId: parentFolderId,
        visibility: CnHierarchyObjectVisibility.VISIBLE,
        objectType: CnHierarchyObjectType.FOLDER,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * Get folder by groups of user
   */
  public async getRootFoldersOfUser(
    userId: string,
    spaceId: string,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    return await this.findPaginated(page, size, {
      where: {
        users: { userId: userId },
        spaceId: spaceId,
        parentId: IsNull(),
        visibility: CnHierarchyObjectVisibility.VISIBLE,
      },
      order: {
        lastModifiedAt: 'DESC',
      },
    });
  }

  public async getAllRootFoldersOfUser(
    userId: string,
    spaceId: string,
    visibility?: CnHierarchyObjectVisibility
  ): Promise<CnHierarchyObject[]> {
    return await this.repository.find({
      where: {
        users: { userId: userId },
        spaceId: spaceId,
        parentId: IsNull(),
        visibility: visibility,
      },
      order: {
        lastModifiedAt: 'DESC',
      },
    });
  }

  public async getDirectChildren(folderId: string): Promise<CnHierarchyObject[]> {
    return this.repository.find({
      where: {
        parentId: folderId,
      },
      order: {
        objectTypeOrder: 'ASC',
        lastModifiedAt: 'DESC',
      },
    });
  }

  public async searchRootFolders(
    userId: string,
    spaceId: string,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    const searchBuilder: BlSearchBuilder<CnHierarchyObjectEntity> = new BlSearchBuilder();
    // force the sort by objectType first
    searchBuilder.mergeOrderOptions({ objectTypeOrder: 'ASC' });
    searchBuilder.addSearchParams(searchParam);
    searchBuilder.mergeWhereOptions({
      spaceId: spaceId,
      visibility: CnHierarchyObjectVisibility.VISIBLE,
      users: { userId: userId },
      parentId: IsNull(),
    });

    return await this.findPaginated(page, size, searchBuilder.build());
  }

  private buildFolderChildrenSearch(
    folderId: string,
    visibility: CnHierarchyObjectVisibility,
    searchParam: BlSearchParams
  ): BlSearchBuilder<CnHierarchyObjectEntity> {
    const searchBuilder: BlSearchBuilder<CnHierarchyObjectEntity> = new BlSearchBuilder();
    // force the sort by objectType first
    searchBuilder.mergeOrderOptions({ objectTypeOrder: 'ASC' });
    searchBuilder.addSearchParams(searchParam);
    searchBuilder.mergeWhereOptions({ parentId: folderId, visibility: visibility });
    return searchBuilder;
  }

  public async searchInFolderChildren(
    folderId: string,
    visibility: CnHierarchyObjectVisibility,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    const searchBuilder = this.buildFolderChildrenSearch(folderId, visibility, searchParam);
    return await this.findPaginated(page, size, searchBuilder.build());
  }

  public async findAllIdsByFolderChildren(
    folderId: string,
    visibility: CnHierarchyObjectVisibility,
    searchParam: BlSearchParams
  ): Promise<string[]> {
    const searchBuilder = this.buildFolderChildrenSearch(folderId, visibility, searchParam);
    const options = searchBuilder.build();
    const entities = await this.repository.find({
      ...options,
      select: { id: true },
    });

    return entities.map((entity) => entity.id);
  }

  public async searchInRootFoldersAndChildren(
    rootFoldersIds: string[],
    spaceId: string,
    visibility: CnHierarchyObjectVisibility,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObjectWithParent>> {
    const searchBuilder = new CnHierarchyObjectSearchBuilder();
    searchBuilder.addSearchInRootFolderAndChildrenOption(rootFoldersIds, spaceId, visibility, searchParam);

    searchBuilder.setRelations({ parent: true });
    return await this.findPaginated(page, size, searchBuilder.build());
  }

  public async searchInRootFoldersAndChildrenByType(
    scope: CnRootFoldersSearchScope,
    objectType: CnHierarchyObjectType,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    const searchBuilder = new CnHierarchyObjectSearchBuilder();
    searchBuilder.addSearchInRootFolderAndChildrenOption(
      scope.rootFoldersIds,
      scope.spaceId,
      scope.visibility,
      searchParam
    );
    searchBuilder.mergeWhereOptions({ objectType: objectType });
    return await this.findPaginated(page, size, searchBuilder.build());
  }

  public getFolderTreeAsList(folder: CnHierarchyObject): Promise<CnHierarchyObject[]> {
    return this.repository.findDescendants(folder as CnHierarchyObjectEntity);
  }

  public async getRootFoldersBySpace(
    spaceId: string,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    return this.findPaginated(page, size, {
      where: {
        spaceId: spaceId,
        parentId: IsNull(),
        visibility: CnHierarchyObjectVisibility.VISIBLE,
      },
      order: { name: 'ASC' },
    });
  }

  public async searchInSpace(
    spaceId: string,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    const searchBuilder: BlSearchBuilder<CnHierarchyObjectEntity> = new BlSearchBuilder();
    // force the sort by objectType first
    searchBuilder.mergeOrderOptions({ objectTypeOrder: 'ASC' });
    searchBuilder.mergeWhereOptions({ spaceId: spaceId });

    // handle includeTrashObject
    if (searchParam.getFilterValue('includeTrashObjects')) {
      searchBuilder.mergeWhereOptions({
        visibility: In([CnHierarchyObjectVisibility.VISIBLE, CnHierarchyObjectVisibility.TRASH]),
      });
    } else {
      searchBuilder.mergeWhereOptions({ visibility: CnHierarchyObjectVisibility.VISIBLE });
    }
    searchParam.removeFilter('includeTrashObjects');
    searchBuilder.addSearchParams(searchParam);

    return await this.findPaginated(page, size, searchBuilder.build());
  }

  public async getFolderTreeForChat(
    folder: CnHierarchyObject
  ): Promise<CnHierarchyObjectWithChildren | null> {
    const folderTree = await this.getFolderTree(folder);

    const newFolderTree = this.filterFolderTreeForChat(folderTree);

    // if there is no chat enabled in the hierarchy, we return null
    if (!newFolderTree.chatEnabled && newFolderTree.children.length === 0) {
      return null;
    }
    return newFolderTree.sortChildrenTree();
  }

  /**
   * Method to filter the folder tree to keep only the nodes and their parents where chat is enabled
   * If a branch does not have chat enabled, it is removed
   * @param folder
   * @private
   */
  private filterFolderTreeForChat(folder: CnHierarchyObjectWithChildren): CnHierarchyObjectWithChildren {
    const filteredChildren: CnHierarchyObjectWithChildren[] = [];

    for (const child of folder.children) {
      const filteredChild = this.filterFolderTreeForChat(child);
      if (filteredChild.chatEnabled || filteredChild.children.length > 0) {
        filteredChildren.push(filteredChild);
      }
    }

    folder.children = filteredChildren as CnHierarchyObjectEntity[];
    return folder;
  }

  /**
   * Update the parent of a leaf object
   * @param hierarchyObjectId
   * @param newParent
   * @param entityManager
   */
  public async updateLeafParent(
    hierarchyObjectId: string,
    newParent: CnHierarchyObject,
    entityManager?: EntityManager
  ): Promise<CnHierarchyObject> {
    return this.updatePartial(
      hierarchyObjectId,
      {
        parentId: newParent.id,
        parent: newParent,
        rootParentId: newParent.getRootFolderId(),
      },
      entityManager
    );
  }

  /**
   * Update the parent of a folder and update all the children rootParentId
   * @param hierarchyObject
   * @param newParent
   * @param entityManager
   */
  public async updateFolderParent(
    hierarchyObject: CnHierarchyObject,
    newParent: CnHierarchyObject,
    entityManager: EntityManager
  ): Promise<CnHierarchyObject> {
    if (hierarchyObject.getRootFolderId() !== newParent.getRootFolderId()) {
      // update the children rootParentId
      const children = await this.getFolderTreeAsList(hierarchyObject);
      // get the children ids, exclude current object
      const childrenIds = children.map((child) => child.id).filter((id) => id !== hierarchyObject.id);
      if (childrenIds.length > 0) {
        await this.getEntityManager(entityManager).update(
          CnHierarchyObjectEntity,
          {
            id: In(childrenIds),
          },
          { rootParentId: newParent.getRootFolderId() }
        );
      }
    }

    return this.updateLeafParent(hierarchyObject.id, newParent, entityManager);
  }

  public migrate(hierarchyObject: CnHierarchyObject): Promise<CnHierarchyObject> {
    return this.repository.save(hierarchyObject, { listeners: false });
  }

  public findChildrenByNameAndType(
    parentId: string,
    name: string,
    type: CnHierarchyObjectType
  ): Promise<CnHierarchyObject[]> {
    return this.repository.find({
      where: { parentId: parentId, name: name, objectType: type },
    });
  }

  public async updateLastTags(hierarchyObject: CnHierarchyObject, tags: CnTag[]): Promise<CnHierarchyObject> {
    hierarchyObject.setLastTags(tags);
    await this.repository.update(hierarchyObject.id, { lastTagsStr: hierarchyObject.lastTagsStr });
    return hierarchyObject;
  }

  public async updateObjectAndChildrenVisibility(
    hierarchyObjectId: string,
    hierarchyObjectIds: string[],
    visibility: CnHierarchyObjectVisibility
  ): Promise<CnHierarchyObject> {
    if (visibility === CnHierarchyObjectVisibility.HIDDEN) {
      throw new BlBadRequestException('Cannot modify the visibility of a hidden object');
    }

    await this.repository.update(
      {
        id: In(hierarchyObjectIds),
      },
      {
        visibility: visibility,
      }
    );

    return this.findByIdAndCheck(hierarchyObjectId);
  }

  public getAllChildrenInTrash(folderId: string): Promise<CnHierarchyObject[]> {
    return this.repository.find({
      where: {
        parentId: folderId,
        visibility: CnHierarchyObjectVisibility.TRASH,
      },
    });
  }
}
