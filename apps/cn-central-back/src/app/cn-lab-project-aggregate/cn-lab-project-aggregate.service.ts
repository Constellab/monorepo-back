import { Injectable } from '@nestjs/common';
import { CnProjectAggregateService } from '../cn-projects-aggregate/cn-project-aggregate.service';
import { CnLabInstanceAggregateService } from '../cn-lab-instances/cn-lab-instance-aggregate.service';
import { CnLabProject } from './cn-lab-project.entity';
import { CnLabInstance } from '../cn-lab-instances/cn-lab-instance.entity';
import { BlBadRequestException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnLabProjectService } from './cn-lab-project.service';
import { DataSource } from 'typeorm';
import { CnExternalLabProjectService } from '../cn-external-lab-api/cn-external-lab-project.service';
import { CnExternalLabApiService } from '../cn-external-lab-api/cn-external-lab-api.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import {
  CnFolderHierarchy,
  CnFolderHierarchyWithChildren
} from '../cn-projects-aggregate/cn-folder-hierarchies/cn-folder-hierarchy.entity';

@Injectable()
export class CnLabProjectAggregateService {

  constructor(private projectAggregateService: CnProjectAggregateService,
              private labAggregateService: CnLabInstanceAggregateService,
              private labProjectService: CnLabProjectService,
              private dataSource: DataSource,
              private externalLabProjectService: CnExternalLabProjectService,
              private externalLabApiService: CnExternalLabApiService) {
  }


  public async addFolderToLab(labInstanceId: string, rootFolderId: string): Promise<CnLabProject> {
    // get and check if the user can manage the lab
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId, false);

    return this.addRootFolderToLabInsecure(labInstance, rootFolderId);
  }

  public async addRootFolderToLabInsecure(labInstance: CnLabInstance, rootFolderId: string): Promise<CnLabProject> {
    // get and check if the user can see the project
    const folderTree = await this.projectAggregateService.getFolderTree(rootFolderId);

    return await this.dataSource.transaction(async entityManager => {
      const labFolder = await this.labProjectService.createLabInstanceFolder(labInstance, folderTree, entityManager);
      await this.syncFolderToLab(labInstance, folderTree);

      return labFolder;
    });
  }

  public async forceFolderSyncToLab(labInstanceId: string, rootFolderId: string): Promise<void> {
    const labFolder = await this.labProjectService.findByRootFolderId(rootFolderId);
    if (labFolder == null) throw new BlUnauthorizedException();

    const labManager = await this.getAndCheckAuthorizationToFindLabById(labInstanceId);

    const folderTree = await this.projectAggregateService.getFolderTree(rootFolderId);
    await this.syncFolderToLab(labManager, folderTree);
  }

  public async syncFolderToLab(labInstance: CnLabInstance, folderTree: CnFolderHierarchyWithChildren): Promise<void> {
    // add the user to the lab is the lab is running
    const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo());
    if (labIsRunning) {
      // add the folder to the lab
      await this.externalLabProjectService.addFolderInLab(labInstance.getGlabSpaceApiInfo(), folderTree);
    }
  }

  public async checkAndRemoveFolderFromLab(labInstanceId: string, rootFolderId: string): Promise<void> {
    // get and check if the user can manage the lab
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    // check if the project  uses the lab as storage (datahub)
    if (await this.projectAggregateService.projectUsesLabStorage(rootFolderId, labInstanceId)) {
      throw new BlBadRequestException(CnErrorText.REMOVE_PROJECT_USE_LAB_AS_STORAGE_ERROR);
    }

    // Before delete project from lab, check if this project as sync object from this lab
    const syncExperiments = await this.projectAggregateService.getExperimentsByRootFolderAndLabInstanceNotSecure(rootFolderId, labInstanceId);
    if (syncExperiments.length > 0) {
      throw new BlBadRequestException(CnErrorText.REMOVE_PROJECT_SYNC_EXPERIMENT_ERROR, { detailArgs: { count: syncExperiments.length } });
    }

    const syncReports = await this.projectAggregateService.getReportsByRootFolderAndLabInstance(rootFolderId, labInstanceId);
    if (syncReports.length > 0) {
      throw new BlBadRequestException(CnErrorText.REMOVE_PROJECT_SYNC_REPORT_ERROR, { detailArgs: { count: syncReports.length } });
    }

    await this.removeFolderFromLab(labInstance, rootFolderId);
  }

  private async removeFolderFromLab(labInstance: CnLabInstance, rootFolderId: string): Promise<void> {
    return await this.dataSource.transaction(async entityManager => {
      await this.labProjectService.deleteLabInstanceFolder(labInstance.id, rootFolderId, entityManager);

      // remove the project from the lab, if it is available
      const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo());
      if (labIsRunning) {
        await this.externalLabProjectService.deleteFolderInLab(labInstance.getGlabSpaceApiInfo(), rootFolderId);
      }
    });
  }

  public async removeFolderFromAllLabs(rootFolderId: string): Promise<void> {
    const labFolders = await this.labProjectService.findByRootFolderId(rootFolderId);
    for (const labFolder of labFolders) {
      try {
        await this.removeFolderFromLab(labFolder.labInstance, rootFolderId);
      } catch (e) {
        throw new Error(`Error while removing folder from lab '${labFolder.labInstance.name}' : ${e}`);
      }
    }
  }

  public async getCurrentLabInstanceFolders(): Promise<CnFolderHierarchy[]> {
    const labFolders = await this.labProjectService.findByLabInstanceId(CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);
    const folders = labFolders.map(labProject => labProject.rootFolder);
    return this.projectAggregateService.getFolderTrees(folders);
  }

  public async getCurrentLabInstanceRootFolderById(folderId: string): Promise<CnFolderHierarchy> {
    const folder = await this.projectAggregateService.getFolderHierarchyNotSecure(folderId);
    const labFolder = await this.labProjectService.findByRootFolderIdAndLabInstanceId(folder.getRootFolderId(),
      CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);
    if (labFolder == null) {
      throw new BlBadRequestException(CnErrorText.PROJECT_NOT_SHARED_WITH_LAB);
    }

    return this.projectAggregateService.getFolderTree(labFolder.rootFolderId);
  }

  public async findLabFolderByFolderId(rootFolderId: string): Promise<CnLabProject[]> {
    return this.labProjectService.findByRootFolderId(rootFolderId);
  }


  public async getLabInstanceFolders(labInstanceId: string): Promise<CnLabProject[]> {
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
