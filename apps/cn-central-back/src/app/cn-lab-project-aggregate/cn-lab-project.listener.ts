import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CnProjectEvent,
  cnProjectEventName,
  cnRemoveProjectFromAllLabsEventName
} from '../cn-projects-aggregate/cn-project.event';
import { CnProject } from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import { CnProjectAggregateService } from '../cn-projects-aggregate/cn-project-aggregate.service';
import { CnLabProjectAggregateService } from './cn-lab-project-aggregate.service';
import { CnProjectBucketService } from '../cn-projects-aggregate/cn-projects/cn-project-bucket.service';


@Injectable()
export class CnLabProjectListener {

  constructor(private labProjectAggregateService: CnLabProjectAggregateService,
              private projectAggregateService: CnProjectAggregateService,
              private projectBucketService: CnProjectBucketService) {
  }

  @OnEvent(cnProjectEventName)
  async handleCnProjectEvent(event: CnProjectEvent): Promise<void> {
    switch (event.type) {
      case 'CREATE_PROJECT':
        await this.handleCreateRootProject(event.entity);
        break;
      case 'CREATE_SUB_PROJECT':
      case 'UPDATE_PROJECT':
        await this.syncProjectWithLabs(event.parentProject.getRootParentId());
        break;
      case 'DELETE_PROJECT':
        const project: CnProject = event.entity;
        // if the root project was deleted, do nothing
        if (!project.isRootProject()) {
          await this.syncProjectWithLabs(project.getRootParentId());
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
    if (!project.isRootProject()) return;

    const projectBuckets = await this.projectBucketService.getProjectBucket(project.id);
    if (projectBuckets.mainStorage?.isLabBucket()) {
      await this.labProjectAggregateService.addRootProjectToLabInsecure(projectBuckets.mainStorage.labInstance, project.id);
    }

    if (project.backupStorage?.isLabBucket()) {
      await this.labProjectAggregateService.addRootProjectToLabInsecure(project.backupStorage.labInstance, project.id);
    }
  }

  /**
   * Method when the root project is updated or sub project are CRUD.
   * It sync the project with all the lab instances that uses this project.
   * @param rootProject
   * @private
   */
  private async syncProjectWithLabs(rootProject: string): Promise<void> {
    const projectTree = await this.projectAggregateService.getProjectTree(rootProject);

    // get all the lab instance where the project is shared
    const projectLabs = await this.labProjectAggregateService.findLabProjectByProjectId(rootProject);

    // sync the project with the lab instances
    const promises: Promise<void>[] = [];
    for (const projectLab of projectLabs) {
      if (projectLab.labInstance.isHttpAccessible()) {
        promises.push(this.labProjectAggregateService.syncProjectToLab(projectLab.labInstance, projectTree));
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * Handle remove project from lab event
   * if an error is thrown, it will be returned as a string
   * @param rootProject
   */
  @OnEvent(cnRemoveProjectFromAllLabsEventName)
  async handleRemoveProjectFromLabs(rootProject: CnProject): Promise<string | null> {
    try {
      await this.labProjectAggregateService.removeProjectFromAllLabs(rootProject.id);
    } catch (e: any) {
      return e.message;
    }
    return null;
  }
}
