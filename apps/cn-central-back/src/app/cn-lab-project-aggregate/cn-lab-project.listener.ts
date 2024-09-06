import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CnFolderEvent,
  cnProjectEventName,
  cnRemoveProjectFromAllLabsEventName
} from '../cn-projects-aggregate/cn-folder.event';
import { CnProject } from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import { CnProjectAggregateService } from '../cn-projects-aggregate/cn-project-aggregate.service';
import { CnLabProjectAggregateService } from './cn-lab-project-aggregate.service';
import { CnProjectBucketService } from '../cn-projects-aggregate/cn-projects/cn-project-bucket.service';
import { CnFolderHierarchy } from '../cn-projects-aggregate/cn-folder-hierarchies/cn-folder-hierarchy.entity';
import { CnFolderHierarchyService } from '../cn-projects-aggregate/cn-folder-hierarchies/cn-folder-hierarchy.service';


@Injectable()
export class CnLabProjectListener {

  constructor(private labProjectAggregateService: CnLabProjectAggregateService,
              private projectAggregateService: CnProjectAggregateService,
              private projectBucketService: CnProjectBucketService,
              private folderHierarchyService: CnFolderHierarchyService) {
  }

  @OnEvent(cnProjectEventName)
  async handleCnProjectEvent(event: CnFolderEvent): Promise<void> {
    switch (event.type) {
      case 'CREATE_ROOT_PROJECT':
        await this.handleCreateRootProject(event.entity);
        break;
      case 'CREATE_SUB_PROJECT':
      case 'UPDATE_PROJECT':
        await this.syncProjectWithLabs(event.parentFolder.getRootFolderId());
        break;
      case 'DELETE_PROJECT':
        const project: CnProject = event.entity;
        const folder = await this.folderHierarchyService.findByIdAndCheck(project.id);
        // if the root project was deleted, do nothing
        if (!folder.isRootFolder()) {
          await this.syncProjectWithLabs(folder.getRootFolderId());
        }
        break;
    }
  }

  /**
   * When a root project is created, we check if the storage of the project is a lab bucket.
   * If it is the case, we add the project in the lab instance.
   * @param project
   * @private
   */
  private async handleCreateRootProject(project: CnProject): Promise<void> {
    const projectBuckets = await this.projectBucketService.getProjectBucket(project.id);
    if (projectBuckets.mainStorage?.isLabBucket()) {
      await this.labProjectAggregateService.addRootFolderToLabInsecure(projectBuckets.mainStorage.labInstance, project.id);
    }

    if (project.backupStorage?.isLabBucket()) {
      await this.labProjectAggregateService.addRootFolderToLabInsecure(project.backupStorage.labInstance, project.id);
    }
  }

  /**
   * Method when the root project is updated or sub project are CRUD.
   * It sync the project with all the lab instances that uses this project.
   * @param rootFolderId
   * @private
   */
  private async syncProjectWithLabs(rootFolderId: string): Promise<void> {
    const folderTree = await this.projectAggregateService.getFolderTree(rootFolderId);

    // get all the lab instance where the project is shared
    const labFolders = await this.labProjectAggregateService.findLabFolderByFolderId(rootFolderId);

    // sync the project with the lab instances
    const promises: Promise<void>[] = [];
    for (const labFolder of labFolders) {
      if (labFolder.labInstance.isHttpAccessible()) {
        promises.push(this.labProjectAggregateService.syncFolderToLab(labFolder.labInstance, folderTree));
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * Handle remove project from lab event
   * if an error is thrown, it will be returned as a string
   * @param rootFolder
   */
  @OnEvent(cnRemoveProjectFromAllLabsEventName)
  async handleRemoveProjectFromLabs(rootFolder: CnFolderHierarchy): Promise<string | null> {
    try {
      await this.labProjectAggregateService.removeFolderFromAllLabs(rootFolder.id);
    } catch (e: any) {
      return e.message;
    }
    return null;
  }
}
