import { Injectable } from '@nestjs/common';
import { CnHierarchyObjectService } from './cn_hierarchy_objects/cn-hierarchy-object.service';
import { CnFoldersSecurityService } from './cn-folders-security.service';
import { CnFolderEventService } from './cn-folder.event';
import {
  CnHierarchyObject,
  CnHierarchyObjectType,
  CnHierarchyObjectVisibility,
  CnHierarchyObjectWithChildren,
  CnHierarchyObjectWithParent,
} from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { BlBadRequestException, BlSearchParams } from '@monorepo/back-core-lib';
import { CnHierarchyObjectTagAggregateService } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag-aggregate.service';
import { CnHierarchyObjectTag } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag.entity';
import { CnAvailableTags, CnTag } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { ClPage, ClPageI } from '@monorepo/core-lib';
import { CnResourceAggregateService } from './cn-resource-aggregate.service';
import { CnScenarioAggregateService } from './cn-scenario-aggregate.service';
import { CnNoteAggregateService } from './cn-note-aggregate.service';
import { CnDocumentAggregateService } from './cn-document-aggregate.service';
import { CnFolderAggregateService } from './cn-folder-aggregate.service';

@Injectable()
export class CnHierarchyObjectAggregateService {
  constructor(
    private hierarchyObjectService: CnHierarchyObjectService,
    private folderAggregateService: CnFolderAggregateService,
    private resourceAggregateService: CnResourceAggregateService,
    private noteAggregateService: CnNoteAggregateService,
    private scenarioAggregateService: CnScenarioAggregateService,
    private documentAggregateService: CnDocumentAggregateService,
    private tagService: CnHierarchyObjectTagAggregateService,
    private securityService: CnFoldersSecurityService,
    private eventService: CnFolderEventService
  ) {}

  //////////////////// GET /////////////////////////

  public async getHierarchyObject(hierarchyObjectId: string): Promise<CnHierarchyObject> {
    return this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
  }

  public async getObjectAncestors(hierarchyObjectId: string): Promise<CnHierarchyObject[]> {
    // retrieve the folder ancestors
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return await this.hierarchyObjectService.getAncestors(hierarchyObject);
  }

  public async searchVisibleInFolderChildren(
    folderId: string,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    return this.searchInFolderChildren(
      folderId,
      CnHierarchyObjectVisibility.VISIBLE,
      searchParam,
      page,
      size
    );
  }

  public async searchTrashInFolderChildren(
    folderId: string,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    return this.searchInFolderChildren(folderId, CnHierarchyObjectVisibility.TRASH, searchParam, page, size);
  }

  private async searchInFolderChildren(
    folderId: string,
    visibility: CnHierarchyObjectVisibility,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    return this.hierarchyObjectService.searchInFolderChildren(folder.id, visibility, searchParam, page, size);
  }

  public async searchVisibleInRootFoldersAndChildren(
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObjectWithParent>> {
    return this.searchInRootFoldersAndChildren(searchParam, CnHierarchyObjectVisibility.VISIBLE, page, size);
  }

  public async searchTrashInRootFoldersAndChildren(
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObjectWithParent>> {
    return this.searchInRootFoldersAndChildren(searchParam, CnHierarchyObjectVisibility.TRASH, page, size);
  }

  public async searchInCurrentSpace(
    searchParams: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPageI<CnHierarchyObject>> {
    const spaceId = CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    await this.securityService.checkFindAllBySpace();
    return this.hierarchyObjectService.searchInSpace(spaceId, searchParams, page, size);
  }

  private async searchInRootFoldersAndChildren(
    searchParam: BlSearchParams,
    visibility: CnHierarchyObjectVisibility,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObjectWithParent>> {
    const spaceId = CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    const rootFolders = await this.hierarchyObjectService.getAllRootFoldersOfUser(
      CnCurrentUserHelper.getAndCheckCurrentUser().id,
      spaceId
    );
    return this.hierarchyObjectService.searchInRootFoldersAndChildren(
      rootFolders.map((folder) => folder.id),
      spaceId,
      visibility,
      searchParam,
      page,
      size
    );
  }

  ////////////////////// UPDATE ////////////////////

  /**
   * Move an object and all its children to trash
   */
  public async moveToTrash(hierarchyObjectId: string): Promise<CnHierarchyObject> {
    const hierarchyObject = await this.securityService.getAndCheckAuthorizationForHierarchyObjectUpdate(
      hierarchyObjectId,
      true
    );

    if (hierarchyObject.visibility === CnHierarchyObjectVisibility.TRASH) {
      return hierarchyObject;
    }

    const objectTree = await this.checkHierarchyObjectBeforeDelete(hierarchyObject, 'trash');
    const objectAndChildrenToUpdate = objectTree
      .flattenTreeRecursively()
      .filter((hierarchyObject) => hierarchyObject.visibility === CnHierarchyObjectVisibility.VISIBLE)
      .map((object) => object.id);

    const newHierarchyObject = await this.hierarchyObjectService.updateObjectAndChildrenVisibility(
      hierarchyObject.id,
      objectAndChildrenToUpdate,
      CnHierarchyObjectVisibility.TRASH
    );

    const parentFolder = hierarchyObject.parentId
      ? await this.hierarchyObjectService.findByIdAndCheck(hierarchyObject.parentId)
      : null;

    this.eventService.emitFolderEvent('MOVE_OBJECT_TO_TRASH', parentFolder, newHierarchyObject);

    return newHierarchyObject;
  }

  /**
   * Restore an object and its children from trash
   */
  public async restoreFromTrash(hierarchyObjectId: string): Promise<CnHierarchyObject> {
    const hierarchyObject = await this.securityService.getAndCheckAuthorizationForHierarchyObjectUpdate(
      hierarchyObjectId,
      true
    );

    if (hierarchyObject.visibility === CnHierarchyObjectVisibility.VISIBLE) {
      return hierarchyObject;
    }

    // Check that the parent is not in the trash
    if (hierarchyObject.parentId) {
      const parent = await this.hierarchyObjectService.findByIdAndCheck(hierarchyObject.parentId);
      if (parent.visibility === CnHierarchyObjectVisibility.TRASH) {
        throw new BlBadRequestException('The parent folder is in the trash, this object cannot be restored');
      }
    }

    const objectTree = await this.hierarchyObjectService.getObjectTree(hierarchyObject);

    const objectAndChildrenToUpdate = objectTree
      .flattenTreeRecursively()
      .filter((child) => child.visibility === CnHierarchyObjectVisibility.TRASH)
      .map((object) => object.id);

    const newHierarchyObject = await this.hierarchyObjectService.updateObjectAndChildrenVisibility(
      hierarchyObject.id,
      objectAndChildrenToUpdate,
      CnHierarchyObjectVisibility.VISIBLE
    );

    const parentFolder = hierarchyObject.parentId
      ? await this.hierarchyObjectService.findByIdAndCheck(hierarchyObject.parentId)
      : null;

    this.eventService.emitFolderEvent('RESTORE_OBJECT_FROM_TRASH', parentFolder, newHierarchyObject);

    return newHierarchyObject;
  }

  public async moveHierarchyObjectToFolder(
    hierarchyObjectId: string,
    newFolderParentId: string
  ): Promise<CnHierarchyObject> {
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForHierarchyObjectUpdate(hierarchyObjectId);
    if (hierarchyObject.parentId === newFolderParentId) {
      return hierarchyObject;
    }

    const newParentFolder =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(newFolderParentId);

    let newHierarchyObject: CnHierarchyObject;
    switch (hierarchyObject.objectType) {
      case CnHierarchyObjectType.FOLDER:
        newHierarchyObject = await this.folderAggregateService.moveFolder(hierarchyObject, newParentFolder);
        break;
      case CnHierarchyObjectType.DOCUMENT:
      case CnHierarchyObjectType.CONSTELLAB_DOCUMENT:
        newHierarchyObject = await this.documentAggregateService.moveDocumentToFolder(
          hierarchyObject,
          newParentFolder
        );
        break;
      case CnHierarchyObjectType.NOTE:
        newHierarchyObject = await this.noteAggregateService.moveNoteToFolder(
          hierarchyObject,
          newParentFolder
        );
        break;
      case CnHierarchyObjectType.RESOURCE:
      case CnHierarchyObjectType.SCENARIO:
        // simple case where we only need to update the parent
        newHierarchyObject = await this.hierarchyObjectService.updateLeafParent(
          hierarchyObject.id,
          newParentFolder
        );
        break;
      default:
        throw new BlBadRequestException('Cannot move this object');
    }

    this.eventService.emitFolderEvent('MOVE_OBJECT_TO_FOLDER', newParentFolder, newHierarchyObject);
    return newHierarchyObject;
  }

  public async deleteHierarchyObjectById(hierarchyObjectId: string): Promise<void> {
    const hierarchyObject = await this.securityService.getAndCheckAuthorizationForHierarchyObjectUpdate(
      hierarchyObjectId,
      true
    );
    const objectDelete = await this.deleteHierarchyObjectAndChildren(hierarchyObject);
    if (objectDelete) {
      const parentFolder = hierarchyObject.parentId
        ? await this.hierarchyObjectService.findByIdAndCheck(hierarchyObject.parentId)
        : null;

      this.eventService.emitFolderEvent('DELETE_OBJECT', parentFolder, hierarchyObject);
    }
  }

  private async deleteHierarchyObjectAndChildren(hierarchyObject: CnHierarchyObject): Promise<boolean> {
    const objectTree = await this.checkHierarchyObjectBeforeDelete(hierarchyObject, 'delete');

    if (hierarchyObject.visibility === CnHierarchyObjectVisibility.VISIBLE) {
      throw new BlBadRequestException('The objec must be moved to trash before deleting it');
    }
    if (hierarchyObject.isFolder()) {
      return this.deleteFolderAndChildren(objectTree);
    } else {
      return this.deleteHierarchyObject(hierarchyObject);
    }
  }

  private async deleteFolderAndChildren(objectTree: CnHierarchyObjectWithChildren): Promise<boolean> {
    const flatChildren = objectTree
      .flattenTreeRecursively()
      .filter((children) => children.visibility !== CnHierarchyObjectVisibility.HIDDEN);
    // sort the children by number of children using flattenTreeRecursively
    // set the child with less children first
    const sortedChildren = flatChildren.sort(
      (a, b) => a.flattenTreeRecursively().length - b.flattenTreeRecursively().length
    );

    for (const child of sortedChildren) {
      await this.deleteHierarchyObject(child);
    }
    return true;
  }

  private async deleteHierarchyObject(hierarchyObject: CnHierarchyObject): Promise<boolean> {
    switch (hierarchyObject.objectType) {
      case CnHierarchyObjectType.FOLDER:
        return await this.folderAggregateService.deleteFolder(hierarchyObject);
      case CnHierarchyObjectType.CONSTELLAB_DOCUMENT:
      case CnHierarchyObjectType.DOCUMENT:
        return await this.documentAggregateService.deleteDocument(hierarchyObject.id);
      case CnHierarchyObjectType.RESOURCE:
        return await this.resourceAggregateService.deleteResource(hierarchyObject.id);
      case CnHierarchyObjectType.NOTE:
        return await this.noteAggregateService.deleteNote(hierarchyObject.id);
      case CnHierarchyObjectType.SCENARIO:
        return await this.scenarioAggregateService.deleteScenario(hierarchyObject.id);
      default:
        throw new BlBadRequestException('Cannot delete this object');
    }
  }

  private async checkHierarchyObjectBeforeDelete(
    hierarchyObject: CnHierarchyObject,
    mode: 'trash' | 'delete'
  ): Promise<CnHierarchyObjectWithChildren> {
    if (hierarchyObject.isValidated) {
      const error =
        mode === 'trash' ? 'Cannot move a validated object to trash' : 'Cannot delete a validated object';
      throw new BlBadRequestException(error);
    }

    const objectTree = await this.hierarchyObjectService.getObjectTree(hierarchyObject);

    const validatedChildren = objectTree.flattenTreeRecursively().filter((child) => child.isValidated);

    if (validatedChildren.length > 0) {
      const error =
        mode === 'trash'
          ? 'Cannot move the object to trash because it contains validated objects'
          : 'Cannot delete the object because it contains validated objects';
      throw new BlBadRequestException(error);
    }

    return objectTree;
  }

  public async emptyTrash(folderId: string): Promise<void> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    const trashedChildren = await this.hierarchyObjectService.getAllChildrenInTrash(folder.id);
    for (const child of trashedChildren) {
      await this.deleteHierarchyObjectAndChildren(child);
    }

    this.eventService.emitFolderEvent('EMPTY_TRASH', folder, folder);
  }

  /////////////////////////////////////// TAG //////////////////////////////////
  public async createHierarchyObjectTag(
    hierarchyObjectId: string,
    tag: CnTag
  ): Promise<CnHierarchyObjectTag> {
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.createTag(tag, hierarchyObject);
  }

  public async createHierarchyObjectTags(
    hierarchyObjectId: string,
    tags: CnTag[]
  ): Promise<CnHierarchyObjectTag[]> {
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.createTags(tags, hierarchyObject);
  }

  public async createOrReplace(hierarchyObjectId: string, tags: CnTag[]): Promise<CnHierarchyObjectTag[]> {
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.createOrReplaceTagsByKey(tags, hierarchyObject);
  }

  public async deleteHierarchyObjectTag(hierarchyObjectId: string, tag: CnTag): Promise<void> {
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    await this.tagService.deleteTag(tag, hierarchyObject);
  }

  public async deleteHierarchyObjectTags(hierarchyObjectId: string, tags: CnTag[]): Promise<void> {
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    await this.tagService.deleteTags(tags, hierarchyObject);
  }

  public async getHierarchyObjectTagsPaginated(
    hierarchyObjectId: string,
    page: number,
    size: number
  ): Promise<ClPageI<CnTag>> {
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.findByHierarchyObjectPaginated(hierarchyObject, page, size);
  }

  public async getAllHierarchyObjectTags(hierarchyObjectId: string): Promise<CnTag[]> {
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.findAllByHierarchyObject(hierarchyObject);
  }

  public async getAvailableTagsInChildren(hierarchyObjectId: string): Promise<CnAvailableTags> {
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.getAvailableTagsInChildren(hierarchyObject.id);
  }

  public async getAvailableTags(hierarchyObjectId: string): Promise<CnAvailableTags> {
    const hierarchyObject =
      await this.securityService.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);

    // get the available tag of parent, use current for root
    if (hierarchyObject.isRootFolder()) {
      return this.getAvailableTagForRootFolders();
    } else {
      return this.tagService.getAvailableTagsInChildren(hierarchyObject.parentId ?? hierarchyObject.id);
    }
  }

  public async getAvailableTagForRootFolders(): Promise<CnAvailableTags> {
    return this.tagService.getAvailableTagForRootFolders(
      CnCurrentUserHelper.getAndCheckCurrentSpace().id,
      CnCurrentUserHelper.getAndCheckCurrentUser().id
    );
  }
}
