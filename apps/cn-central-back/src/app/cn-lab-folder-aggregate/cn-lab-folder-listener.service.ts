import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CnFolderEvent,
  cnFolderEventName,
  cnRemoveFolderFromAllLabsEventName
} from '../cn-folders-aggregate/cn-folder.event';
import { CnFolder, CnFolderWithStorage } from '../cn-folders-aggregate/cn-folders/cn-folder.entity';
import { CnFolderAggregateService } from '../cn-folders-aggregate/cn-folder-aggregate.service';
import { CnLabFolderAggregateService } from './cn-lab-folder-aggregate.service';
import { CnFolderBucketService } from '../cn-folders-aggregate/cn-folders/cn-folder-bucket.service';
import { CnHierarchyObject } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.service';


@Injectable()
export class CnLabFolderListener {

  constructor(private labFolderAggregateService: CnLabFolderAggregateService,
              private folderAggregateService: CnFolderAggregateService,
              private folderBucketService: CnFolderBucketService,
              private hierarchyObjectService: CnHierarchyObjectService) {
  }

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
      case 'DELETE_FOLDER':
        const folder: CnFolder = event.entity;
        const hierarchyObject = await this.hierarchyObjectService.findByIdAndCheck(folder.id);
        // if the root folder was deleted, do nothing
        if (!hierarchyObject.isRootFolder()) {
          await this.syncFolderWithLabs(hierarchyObject.getRootFolderId());
        }
        break;
    }
  }

  /**
   * When a root folder is created, we check if the storage of the folder is a lab bucket.
   * If it is the case, we add the folder in the lab instance.
   * @param folder
   * @private
   */
  private async handleCreateRootFolder(folder: CnFolderWithStorage): Promise<void> {
    const folderBuckets = await this.folderBucketService.getFolderBucket(folder.id);
    if (folderBuckets.mainStorage?.isLabBucket()) {
      await this.labFolderAggregateService.addRootFolderToLabInsecure(folderBuckets.mainStorage.labInstance, folder.id);
    }

    if (folder.backupStorage?.isLabBucket()) {
      await this.labFolderAggregateService.addRootFolderToLabInsecure(folder.backupStorage.labInstance, folder.id);
    }
  }

  /**
   * Method when the root folder is updated or sub folder are CRUD.
   * It sync the folder with all the lab instances that uses this folder.
   * @param rootFolderId
   * @private
   */
  private async syncFolderWithLabs(rootFolderId: string): Promise<void> {
    const folderTree = await this.folderAggregateService.getFolderTree(rootFolderId);

    // get all the lab instance where the folder is shared
    const labFolders = await this.labFolderAggregateService.findLabFolderByFolderId(rootFolderId);

    // sync the folder with the lab instances
    const promises: Promise<void>[] = [];
    for (const labFolder of labFolders) {
      if (labFolder.labInstance.isHttpAccessible()) {
        promises.push(this.labFolderAggregateService.syncFolderToLab(labFolder.labInstance, folderTree));
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
