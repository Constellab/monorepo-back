import { Injectable } from '@nestjs/common';
import { BlAbstractService, BlSearchParams } from '@monorepo/back-core-lib';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CnFolderHierarchy,
  CnFolderHierarchyEntity,
  CnFolderHierarchyWithChildren,
  CnFolderObjectType
} from './cn-folder-hierarchy.entity';
import { IsNull, Not, TreeRepository } from 'typeorm';
import { ClPage } from '@monorepo/core-lib';
import { CnFolderSearchBuilder } from './cn-folder-search.builder';

@Injectable()
export class CnFolderHierarchyService extends BlAbstractService<CnFolderHierarchyEntity> {
  constructor(@InjectRepository(CnFolderHierarchyEntity)
              private readonly repository: TreeRepository<CnFolderHierarchyEntity>) {
    super(repository, CnFolderHierarchyEntity);
  }

  public async getRootFolder(folder: CnFolderHierarchy): Promise<CnFolderHierarchy> {
    if (folder.isRootFolder()) {
      return folder;
    }
    return this.findByIdAndCheck(folder.getRootFolderId());
  }

  /**
   * Return a simplified list from this folder to the root folder
   */
  public async getAncestors(folder: CnFolderHierarchy): Promise<CnFolderHierarchy[]> {
    const parent = await this.repository.findAncestorsTree(folder as CnFolderHierarchyEntity,
      { relations: ['user'] }
    );
    const folders: CnFolderHierarchy[] = [];
    let currentProject = parent;
    while (currentProject != null) {
      folders.push(currentProject);
      currentProject = currentProject.parent;
    }
    return folders;
  }

  public async getAncestorsByFolderId(folderId: string): Promise<CnFolderHierarchy[]> {
    const folder = await this.findByIdAndCheck(folderId);

    return this.getAncestors(folder);
  }

  /**
   * Get the folder tree from the root folder, only return the node of type folder
   * @param folder
   */
  public async getFolderTree(folder: CnFolderHierarchy): Promise<CnFolderHierarchyWithChildren> {
    const folderTree = await this.repository.findDescendantsTree(folder as CnFolderHierarchyEntity);

    return folderTree.filterChildrenFolder().sortChildrenTree();
  }

  /**
   * Get project by groups of user
   */
  public async getRootFoldersOfUser(userId: string, spaceId: string, page: number, size: number): Promise<ClPage<CnFolderHierarchy>> {
    return await this.findPaginated(page, size, {
      where: {
        users: { userId: userId },
        spaceId: spaceId,
        parentId: IsNull()
      },
      order: {
        lastModifiedAt: 'DESC' as any
      }
    });
  }

  public async getDirectChildren(folderId: string): Promise<CnFolderHierarchy[]> {
    return this.repository.find({
      where: {
        parentId: folderId
      },
      order: {
        objectTypeOrder: 'ASC',
        lastModifiedAt: 'DESC' as any
      }
    });
  }

  public async searchVisibleChildren(folderId: string, searchParam: BlSearchParams,
                                     page: number, size: number): Promise<ClPage<CnFolderHierarchy>> {
    const searchBuilder = new CnFolderSearchBuilder({
      objectTypeOrder: 'ASC',
      lastModifiedAt: 'DESC' as any
    });
    searchBuilder.addSearchParams(searchParam);
    searchBuilder.mergeWhereOptions({ parentId: folderId });

    // If there is no filter on objectType, we exclude hidden documents
    if (!searchBuilder.hasWhereOptions('objectType')) {
      searchBuilder.mergeWhereOptions({ objectType: Not(CnFolderObjectType.HIDDEN_DOCUMENT) });
    }

    return await this.findPaginated(page, size, searchBuilder.build());
  }

  public getFolderTreeAsList(folder: CnFolderHierarchy): Promise<CnFolderHierarchy[]> {
    return this.repository.findDescendants(folder as CnFolderHierarchyEntity);
  }

  public async searchFolderInSpace(spaceId: string, searchParam: BlSearchParams,
                                   page: number, size: number): Promise<ClPage<CnFolderHierarchy>> {
    const searchBuilder = new CnFolderSearchBuilder({ lastModifiedAt: 'DESC' as any });
    searchBuilder.addSearchParams(searchParam);
    searchBuilder.mergeWhereOptions({ spaceId: spaceId, objectType: CnFolderObjectType.FOLDER });

    return await this.findPaginated(page, size, searchBuilder.build());
  }

  public async getRootFoldersBySpace(spaceId: string, page: number, size: number): Promise<ClPage<CnFolderHierarchy>> {
    return this.findPaginated(page, size, {
      where: {
        spaceId: spaceId,
        parentId: IsNull()
      },
      order: { name: 'ASC' }
    });
  }

  public async getFolderTreeForChat(folder: CnFolderHierarchy): Promise<CnFolderHierarchyWithChildren> {
    const folderTree = await this.getFolderTree(folder);

    const newFolderTree = this.filterFolderTreeForChat(folderTree, []);
    return newFolderTree.sortChildrenTree();
  }

  /**
   * Method to filter the folder tree to keep only the folders that have the chat enabled
   * If a folder does not have the chat enabled, its children are attached to the parent
   * @param folder
   * @param children
   * @private
   */
  private filterFolderTreeForChat(folder: CnFolderHierarchyWithChildren, children: CnFolderHierarchyWithChildren[]): CnFolderHierarchyWithChildren {
    for (const child of folder.children) {
      if (child.chatEnabled) {
        children.push(child);
        this.filterFolderTreeForChat(child, []);
      } else {
        this.filterFolderTreeForChat(child, children);
      }
    }

    folder.children = children as CnFolderHierarchyEntity[];
    return folder;
  }
}
