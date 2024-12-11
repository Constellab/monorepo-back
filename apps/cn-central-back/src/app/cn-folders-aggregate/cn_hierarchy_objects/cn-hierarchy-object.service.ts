import { Injectable } from '@nestjs/common';
import { BlAbstractService, BlSearchParams } from '@monorepo/back-core-lib';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
  CnHierarchyObjectWithChildren,
} from './cn-hierarchy-object.entity';
import { EntityManager, IsNull, TreeRepository } from 'typeorm';
import { ClPage } from '@monorepo/core-lib';
import { CnHierarchyObjectSearch } from './cn-hierarchy-object.search';

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
      currentFolder = currentFolder.parent;
    }
    return folders;
  }

  public async getAncestorsByFolderId(folderId: string): Promise<CnHierarchyObject[]> {
    const folder = await this.findByIdAndCheck(folderId);

    return this.getAncestors(folder);
  }

  /**
   * Get the folder tree from the root folder, only return the node of type folder
   * @param folder
   */
  public async getFolderTree(folder: CnHierarchyObject): Promise<CnHierarchyObjectWithChildren> {
    const folderTree = await this.repository.findDescendantsTree(folder as CnHierarchyObjectEntity);

    return folderTree.filterChildrenFolder().sortChildrenTree();
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
      },
      order: {
        lastModifiedAt: 'DESC' as any,
      },
    });
  }

  public async getAllRootFoldersOfUser(userId: string, spaceId: string): Promise<CnHierarchyObject[]> {
    return await this.repository.find({
      where: {
        users: { userId: userId },
        spaceId: spaceId,
        parentId: IsNull(),
      },
      order: {
        lastModifiedAt: 'DESC' as any,
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
        lastModifiedAt: 'DESC' as any,
      },
    });
  }

  public async searchVisibleChildren(
    folderId: string,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    const searchBuilder = new CnHierarchyObjectSearch();
    // force the sort by objectType first
    searchBuilder.mergeOrderOptions({ objectTypeOrder: 'ASC' });
    searchBuilder.addSearchParams(searchParam);
    searchBuilder.mergeWhereOptions({ parentId: folderId });

    // If there is no filter on objectType, we exclude hidden documents
    searchBuilder.mergeWhereOptions({ isVisible: true });

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
      },
      order: { name: 'ASC' },
    });
  }

  public async getFolderTreeForChat(
    folder: CnHierarchyObject
  ): Promise<CnHierarchyObjectWithChildren | null> {
    const folderTree = await this.getFolderTree(folder);

    const newFolderTree = this.filterFolderTreeForChat(folderTree, []);

    // if there is no chat enabled in the hierarchy, we return null
    if (!newFolderTree.chatEnabled && newFolderTree.children.length === 0) {
      return null;
    }
    return newFolderTree.sortChildrenTree();
  }

  /**
   * Method to filter the folder tree to keep only the folders that have the chat enabled
   * If a folder does not have the chat enabled, its children are attached to the parent
   * @param folder
   * @param children
   * @private
   */
  private filterFolderTreeForChat(
    folder: CnHierarchyObjectWithChildren,
    children: CnHierarchyObjectWithChildren[]
  ): CnHierarchyObjectWithChildren {
    for (const child of folder.children) {
      if (child.chatEnabled) {
        children.push(child);
        this.filterFolderTreeForChat(child, []);
      } else {
        this.filterFolderTreeForChat(child, children);
      }
    }

    folder.children = children as CnHierarchyObjectEntity[];
    return folder;
  }

  public updateParent(
    hierarchyObjectId: string,
    newParent: CnHierarchyObject,
    entityManager?: EntityManager
  ): Promise<CnHierarchyObject> {
    return this.updatePartial(
      hierarchyObjectId,
      {
        parentId: newParent.id,
        parent: newParent as CnHierarchyObjectEntity,
        rootParentId: newParent.getRootFolderId(),
      },
      entityManager
    );
  }

  public migrate(hierarchyObject: CnHierarchyObject): Promise<CnHierarchyObject> {
    return this.repository.save(hierarchyObject, { listeners: false });
  }
}
