import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CnFolderEvent,
  CnFolderEventMoveFolderData,
  cnFolderEventName,
  cnRemoveFolderFromAllLabsEventName,
} from '../cn-folders-aggregate/cn-folder.event';
import { CnFolder } from '../cn-folders-aggregate/cn-folders/cn-folder.entity';
import { CnFolderAggregateService } from '../cn-folders-aggregate/cn-folder-aggregate.service';
import { CnLabFolderAggregateService } from './cn-lab-folder-aggregate.service';
import { CnFolderBucketService } from '../cn-folders-aggregate/cn-folders/cn-folder-bucket.service';
import { CnHierarchyObject } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.entity';

@Injectable()
export class CnLabFolderListener {
  constructor(
    private labFolderAggregateService: CnLabFolderAggregateService,
    private folderAggregateService: CnFolderAggregateService,
    private folderBucketService: CnFolderBucketService
  ) {}

  @OnEvent(cnFolderEventName)
  async handleCnFolderEvent(event: CnFolderEvent): Promise<void> {
    switch (event.type) {
      case 'CREATE_ROOT_FOLDER':
        await this.handleCreateRootFolder(event.entity);
        break;
      case 'CREATE_SUB_FOLDER':
      case 'UPDATE_FOLDER':
        await this.syncFolderWithLabs(event.parentFolder.getRootFolderId());
        break;
      case 'UPLOAD_FOLDER':
        // on a folder upload, we sync the root folder
        await this.syncFolderWithLabs(event.parentFolder.getRootFolderId());
        break;
      case 'DELETE_OBJECT':
      case 'MOVE_OBJECT_TO_TRASH':
        const hierarchyObject: CnHierarchyObject = event.entity;
        // if the root folder was deleted, do nothing
        if (hierarchyObject.isFolder() && !hierarchyObject.isRootFolder()) {
          await this.syncFolderWithLabs(hierarchyObject.getRootFolderId());
        }
        break;
      case 'RESTORE_OBJECT_FROM_TRASH':
        const restoredObject: CnHierarchyObject = event.entity;
        // if the root folder was restored, do nothing
        if (restoredObject.isFolder() && !restoredObject.isRootFolder()) {
          await this.syncFolderWithLabs(restoredObject.getRootFolderId());
        }
        break;
      case 'MOVE_FOLDER':
        await this.handledMovedFolder(event.entity);
        break;
    }
  }

  /**
   * When a root rootFolder is created, we check if the storage of the rootFolder is a lab bucket.
   * If it is the case, we add the rootFolder in the lab.
   * @param rootFolder
   * @private
   */
  private async handleCreateRootFolder(rootFolder: CnFolder): Promise<void> {
    const folderBuckets = await this.folderBucketService.getRootFolderBucket(rootFolder.id);
    if (folderBuckets.mainStorage?.isLabBucket()) {
      await this.labFolderAggregateService.addRootFolderToLabInsecure(
        folderBuckets.mainStorage.lab,
        rootFolder.id
      );
    }

    if (folderBuckets.backupStorage?.isLabBucket()) {
      await this.labFolderAggregateService.addRootFolderToLabInsecure(
        folderBuckets.backupStorage.lab,
        rootFolder.id
      );
    }
  }

  /**
   * Method when the root folder is updated or sub folder are CRUD.
   * It sync the folder with all the labs that uses this folder.
   * @param rootFolderId
   * @private
   */
  private async syncFolderWithLabs(rootFolderId: string): Promise<void> {
    const folderTree = await this.folderAggregateService.getFolderTree(rootFolderId);

    // get all the lab where the folder is shared
    const labFolders = await this.labFolderAggregateService.findLabFolderByFolderId(rootFolderId);

    // sync the folder with the labs
    const promises: Promise<void>[] = [];
    for (const labFolder of labFolders) {
      if (labFolder.lab.isHttpAccessible()) {
        promises.push(this.labFolderAggregateService.syncFolderToLab(labFolder.lab, folderTree));
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * When a folder is moved, we sync all the folder of the labs that uses the old or new root folder.
   * @param data
   * @private
   */
  private async handledMovedFolder(data: CnFolderEventMoveFolderData): Promise<void> {
    const rootFolderIds = [data.newParentFolder.getRootFolderId()];
    if (data.oldParentRootFolderId !== data.newParentFolder.getRootFolderId()) {
      rootFolderIds.push(data.oldParentRootFolderId);
    }

    // get all the lab where the folder is shared
    const labFolders = await this.labFolderAggregateService.findLabFolderByFolderIds(rootFolderIds);

    // retrieve labs that uses
    const syncedLab: string[] = [];
    const promises: Promise<void>[] = [];

    for (const labFolder of labFolders) {
      // prevent to sync the same lab multiple times
      if (!syncedLab.includes(labFolder.labId)) {
        if (labFolder.lab.isHttpAccessible()) {
          promises.push(this.labFolderAggregateService.syncAllFolderInsecure(labFolder.lab));
        }
        syncedLab.push(labFolder.labId);
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * Handle remove folder from lab event
   * if an error is thrown, it will be returned as a string
   * @param rootFolder
   */
  @OnEvent(cnRemoveFolderFromAllLabsEventName)
  async handleRemoveFolderFromLabs(rootFolder: CnHierarchyObject): Promise<string | null> {
    try {
      await this.labFolderAggregateService.removeFolderFromAllLabs(rootFolder.id);
    } catch (e: any) {
      return e.message;
    }
    return null;
  }
}
