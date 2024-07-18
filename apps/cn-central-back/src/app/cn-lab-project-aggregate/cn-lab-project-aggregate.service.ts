import { Injectable } from '@nestjs/common';
import { CnProjectAggregateService } from '../cn-projects-aggregate/cn-project-aggregate.service';
import { CnLabInstanceAggregateService } from '../cn-lab-instances/cn-lab-instance-aggregate.service';
import { CnLabProject } from './cn-lab-project.entity';
import { CnLabInstance } from '../cn-lab-instances/cn-lab-instance.entity';
import { BlBadRequestException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnProject } from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnLabProjectService } from './cn-lab-project.service';
import { DataSource } from 'typeorm';
import { CnExternalLabProjectService } from '../cn-external-lab-api/cn-external-lab-project.service';
import { CnExternalLabApiService } from '../cn-external-lab-api/cn-external-lab-api.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';

@Injectable()
export class CnLabProjectAggregateService {

  constructor(private projectAggregateService: CnProjectAggregateService,
              private labAggregateService: CnLabInstanceAggregateService,
              private labProjectService: CnLabProjectService,
              private dataSource: DataSource,
              private externalLabProjectService: CnExternalLabProjectService,
              private externalLabApiService: CnExternalLabApiService) {
  }


  public async addProjectToLab(labInstanceId: string, rootProjectId: string): Promise<CnLabProject> {
    // get and check if the user can manage the lab
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId, false);

    return this.addRootProjectToLabInsecure(labInstance, rootProjectId);
  }

  public async addRootProjectToLabInsecure(labInstance: CnLabInstance, rootProjectId: string): Promise<CnLabProject> {
    // get and check if the user can see the project
    const projectTree = await this.projectAggregateService.getProjectTree(rootProjectId);

    return await this.dataSource.transaction(async entityManager => {
      const labProject = await this.labProjectService.createLabInstanceProject(labInstance, projectTree, entityManager);
      await this.syncProjectToLab(labInstance, projectTree);

      return labProject;
    });
  }

  public async forceProjectSyncToLab(labInstanceId: string, rootProjectId: string): Promise<void> {
    const labProject = await this.labProjectService.findByProjectId(rootProjectId);
    if (labProject == null) throw new BlUnauthorizedException();

    const labManager = await this.getAndCheckAuthorizationToFindLabById(labInstanceId);

    const projectTree = await this.projectAggregateService.getProjectTree(rootProjectId);
    await this.syncProjectToLab(labManager, projectTree);
  }

  public async syncProjectToLab(labInstance: CnLabInstance, projectTree: CnProject): Promise<void> {
    // add the user to the lab is the lab is running
    const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo());
    if (labIsRunning) {
      // add the project to the lab
      await this.externalLabProjectService.addProjectInLab(labInstance.getGlabSpaceApiInfo(), projectTree);
    }
  }

  public async checkAndRemoveProjectFromLab(labInstanceId: string, rootProjectId: string): Promise<void> {
    // get and check if the user can manage the lab
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    // check if the project  uses the lab as storage (datahub)
    if (await this.projectAggregateService.projectUsesLabStorage(rootProjectId, labInstanceId)) {
      throw new BlBadRequestException(CnErrorText.REMOVE_PROJECT_USE_LAB_AS_STORAGE_ERROR);
    }

    // Before delete project from lab, check if this project as sync object from this lab
    const syncExperiments = await this.projectAggregateService.getExperimentsByRootProjectAndLabInstance(rootProjectId, labInstanceId);
    if (syncExperiments.length > 0) {
      throw new BlBadRequestException(CnErrorText.REMOVE_PROJECT_SYNC_EXPERIMENT_ERROR, { detailArgs: { count: syncExperiments.length } });
    }

    const syncReports = await this.projectAggregateService.getReportsByRootProjectAndLabInstance(rootProjectId, labInstanceId);
    if (syncReports.length > 0) {
      throw new BlBadRequestException(CnErrorText.REMOVE_PROJECT_SYNC_REPORT_ERROR, { detailArgs: { count: syncReports.length } });
    }

    await this.removeProjectFromLab(labInstance, rootProjectId);
  }

  private async removeProjectFromLab(labInstance: CnLabInstance, rootProjectId: string): Promise<void> {
    return await this.dataSource.transaction(async entityManager => {
      await this.labProjectService.deleteLabInstanceProject(labInstance.id, rootProjectId, entityManager);

      // remove the project from the lab, if it is available
      const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo());
      if (labIsRunning) {
        await this.externalLabProjectService.deleteProjectInLab(labInstance.getGlabSpaceApiInfo(), rootProjectId);
      }
    });
  }

  public removeProjectFromAllLabs(rootProjectId: string): Promise<void> {
    return this.dataSource.transaction(async entityManager => {
      const labProjects = await this.labProjectService.findByProjectId(rootProjectId);
      for (const labProject of labProjects) {
        try {
          await this.removeProjectFromLab(labProject.labInstance, rootProjectId);
        } catch (e) {
          throw new Error(`Error while removing project from lab '${labProject.labInstance.name}' : ${e}`);
        }
      }
    });
  }

  public async getCurrentLabInstanceProjects(): Promise<CnProject[]> {
    const labProjects = await this.labProjectService.findByLabInstanceId(CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);
    const projects = labProjects.map(labProject => labProject.project);
    return this.projectAggregateService.getProjectTrees(projects);
  }

  public async findLabProjectByProjectId(projectId: string): Promise<CnLabProject[]> {
    return this.labProjectService.findByProjectId(projectId);
  }


  public async getLabInstanceProjects(labInstanceId: string): Promise<CnLabProject[]> {
    // get and check if the user can manage the lab
    await this.getAndCheckAuthorizationToFindLabById(labInstanceId);

    return this.labProjectService.findByLabInstanceId(labInstanceId);
  }

  public async getAndCheckAuthorizationToManageLab(id: string, refuseDesktop: boolean = true): Promise<CnLabInstance> {
    return this.labAggregateService.getAndCheckAuthorizationToManageLab(id, refuseDesktop);
  }

  public async getAndCheckAuthorizationToFindLabById(id: string, refuseDesktop: boolean = true): Promise<CnLabInstance> {
    return this.labAggregateService.getAndCheckAuthorizationToManageLab(id, refuseDesktop);
  }
}
