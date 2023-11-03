import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {CnProjectEvent, cnProjectEventName} from '../cn-projects-aggregate/cn-project.event';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnLabInstanceAggregateService} from './cn-lab-instance-aggregate.service';
import {CnBucketsService} from '../cn-object-storages/cn-buckets/cn-buckets.service';
import {CnBucket} from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import {CnLabInstanceProjectService} from './project/cn-lab-instance-project.service';
import {CnProjectAggregateService} from '../cn-projects-aggregate/cn-project-aggregate.service';


@Injectable()
export class CnLabInstanceListener {

  constructor(private labAggregateService: CnLabInstanceAggregateService,
              private labProjectService: CnLabInstanceProjectService,
              private projectAggregateService: CnProjectAggregateService,
              private bucketService: CnBucketsService) {
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
    }
  }

  /**
   * When a root project is created, we check if the storage of the project is a lab bucket.
   * If it is the case, we add the project in the lab instance.
   * @param project
   * @private
   */
  private async handleCreateRootProject(project: CnProject): Promise<void> {
    if (project.mainStorage?.isLabBucket()) {
      await this.addProjectInLab(project.mainStorage.id, project.id);
    }

    if (project.backupStorage?.isLabBucket()) {
      await this.addProjectInLab(project.backupStorage.id, project.id);
    }
  }

  private async addProjectInLab(bucketId: string, projectId: string): Promise<void> {
    const bucket = await this.bucketService.findById(bucketId, CnBucket.configRelation);
    await this.labAggregateService.addRootProjectInLabInsecure(bucket.labInstance, projectId);
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
    const projectLabs = await this.labProjectService.findByProjectId(rootProject);

    // sync the project with the lab instances
    const promises: Promise<void>[] = [];
    for (const projectLab of projectLabs) {
      if (projectLab.labInstance.isHttpAccessible()) {
        promises.push(this.labAggregateService.syncProjectInLab(projectLab.labInstance, projectTree));
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }
}
