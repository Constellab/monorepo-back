import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  CnFolderEvent,
  CnFolderEventMoveObjectToFolderData,
  cnFolderEventName,
  cnRemoveFolderFromAllLabsEventName,
} from '../cn-folders-aggregate/cn-folder.event';
import { CnFolderAggregateService } from '../cn-folders-aggregate/cn-folder-aggregate.service';
import { CnFolder } from '../cn-folders-aggregate/cn-folders/cn-folder.entity';
import { CnFolderBucketService } from '../cn-folders-aggregate/cn-folders/cn-folder-bucket.service';
import {
  CnHierarchyObject,
  CnHierarchyObjectType,
} from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnLabFolderAggregateService } from './cn-lab-folder-aggregate.service';

@Injectable()
export class CnLabFolderListener {
  protected readonly logger = new Logger(CnLabFolderListener.name);

  constructor(
    private labFolderAggregateService: CnLabFolderAggregateService,
    private folderAggregateService: CnFolderAggregateService,
    private folderBucketService: CnFolderBucketService
  ) {}

  @OnEvent(cnFolderEventName)
  async handleCnFolderEvent(event: CnFolderEvent): Promise<void> {
    try {
      switch (event.payload.type) {
        case 'CREATE_ROOT_FOLDER':
          await this.handleCreateRootFolder(event.payload.entity);
          break;
        case 'UPDATE_FOLDER':
          await this.syncFolderWithLabs(event.payload.folderHierarchyObject.getRootFolderId());
          break;
        case 'CREATE_SUB_FOLDER':
          await this.syncFolderWithLabs(event.payload.parentFolder.getRootFolderId());
          break;
        case 'UPLOAD_FOLDER':
          // on a folder upload, we sync the root folder
          await this.syncFolderWithLabs(event.payload.parentFolder.getRootFolderId());
          break;
        case 'MOVE_OBJECT_TO_TRASH':
          await this.handleMoveToTrash(event.payload.entity);
          break;
        case 'DELETE_OBJECT':
          await this.handleDelete(event.payload.entity);
          break;
        case 'RESTORE_OBJECT_FROM_TRASH':
          const restoredObject: CnHierarchyObject = event.payload.entity;
          // if the root folder was restored, do nothing
          if (restoredObject.isFolder() && !restoredObject.isRootFolder()) {
            await this.syncFolderWithLabs(restoredObject.getRootFolderId());
          }
          break;
        case 'MOVE_OBJECT_TO_FOLDER':
          await this.handleMoveObject(event.payload.entity);
          break;
      }
    } catch (error: any) {
      this.logger.error(
        `[CnLabFolderListener] Error while handling folder event ${event.payload.type}. Error ${error}`
      );
      if (error.stack) {
        this.logger.error(error.stack);
      }
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
   * It syncs the folder with all the labs that uses this folder.
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

  private async handleMoveObject(data: CnFolderEventMoveObjectToFolderData): Promise<void> {
    if (data.hierarchyObject.isFolder()) {
      await this.handledMovedFolder(data);
    } else if (data.hierarchyObject.objectType === CnHierarchyObjectType.SCENARIO) {
      await this.labFolderAggregateService.syncScenarioToLab(data.hierarchyObject.id);
    } else if (data.hierarchyObject.objectType === CnHierarchyObjectType.NOTE) {
      await this.labFolderAggregateService.syncNoteToLab(data.hierarchyObject.id);
    }
  }

  /**
   * When a folder is moved, we sync all the folder of the labs that uses the old or new root folder.
   * @param data
   * @private
   */
  private async handledMovedFolder(data: CnFolderEventMoveObjectToFolderData): Promise<void> {
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

  private async handleMoveToTrash(hierarchyObject: CnHierarchyObject): Promise<void> {
    // if the root folder was deleted, do nothing
    if (hierarchyObject.isFolder() && !hierarchyObject.isRootFolder()) {
      await this.syncFolderWithLabs(hierarchyObject.getRootFolderId());
    }
  }

  private async handleDelete(hierarchyObject: CnHierarchyObject): Promise<void> {
    // if the root folder was deleted, do nothing
    if (hierarchyObject.isFolder() && !hierarchyObject.isRootFolder()) {
      await this.syncFolderWithLabs(hierarchyObject.getRootFolderId());
      return;
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
