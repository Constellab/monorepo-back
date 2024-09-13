import { Injectable } from '@nestjs/common';
import { CnFolderAggregateService } from '../cn-folders-aggregate/cn-folder-aggregate.service';
import { CnLabInstanceAggregateService } from '../cn-lab-instances/cn-lab-instance-aggregate.service';
import { CnLabFolder, CnLabFolderWithLab, CnLabFolderWithRootFolder } from './cn-lab-folder.entity';
import { CnLabInstance } from '../cn-lab-instances/cn-lab-instance.entity';
import { BlBadRequestException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnLabFolderService } from './cn-lab-folder.service';
import { DataSource } from 'typeorm';
import { CnExternalLabFolderService } from '../cn-external-lab-api/cn-external-lab-folder.service';
import { CnExternalLabApiService } from '../cn-external-lab-api/cn-external-lab-api.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import {
  CnHierarchyObject,
  CnHierarchyObjectWithChildren
} from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.entity';

@Injectable()
export class CnLabFolderAggregateService {

  constructor(private folderAggregateService: CnFolderAggregateService,
              private labAggregateService: CnLabInstanceAggregateService,
              private labFolderService: CnLabFolderService,
              private dataSource: DataSource,
              private externalLabFolderService: CnExternalLabFolderService,
              private externalLabApiService: CnExternalLabApiService) {
  }


  public async addFolderToLab(labInstanceId: string, rootFolderId: string): Promise<CnLabFolder> {
    // get and check if the user can manage the lab
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId, false);

    return this.addRootFolderToLabInsecure(labInstance, rootFolderId);
  }

  public async addRootFolderToLabInsecure(labInstance: CnLabInstance, rootFolderId: string): Promise<CnLabFolder> {
    // get and check if the user can see the folder
    const folderTree = await this.folderAggregateService.getFolderTree(rootFolderId);

    return await this.dataSource.transaction(async entityManager => {
      const labFolder = await this.labFolderService.createLabInstanceFolder(labInstance, folderTree, entityManager);
      await this.syncFolderToLab(labInstance, folderTree);

      return labFolder;
    });
  }

  public async forceFolderSyncToLab(labInstanceId: string, rootFolderId: string): Promise<void> {
    const labFolder = await this.labFolderService.findByRootFolderId(rootFolderId);
    if (labFolder == null) throw new BlUnauthorizedException();

    const labManager = await this.getAndCheckAuthorizationToFindLabById(labInstanceId);

    const folderTree = await this.folderAggregateService.getFolderTree(rootFolderId);
    await this.syncFolderToLab(labManager, folderTree);
  }

  public async syncFolderToLab(labInstance: CnLabInstance, folderTree: CnHierarchyObjectWithChildren): Promise<void> {
    // add the user to the lab is the lab is running
    const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo());
    if (labIsRunning) {
      // add the folder to the lab
      await this.externalLabFolderService.addFolderInLab(labInstance.getGlabSpaceApiInfo(), folderTree);
    }
  }

  public async checkAndRemoveFolderFromLab(labInstanceId: string, rootFolderId: string): Promise<void> {
    // get and check if the user can manage the lab
    const labInstance = await this.getAndCheckAuthorizationToManageLab(labInstanceId);

    // check if the folder  uses the lab as storage (datahub)
    if (await this.folderAggregateService.folderUsesLabStorage(rootFolderId, labInstanceId)) {
      throw new BlBadRequestException(CnErrorText.REMOVE_FOLDER_USE_LAB_AS_STORAGE_ERROR);
    }

    // Before delete folder from lab, check if this folder as sync object from this lab
    const syncExperiments = await this.folderAggregateService.getExperimentsByRootFolderAndLabInstanceNotSecure(rootFolderId, labInstanceId);
    if (syncExperiments.length > 0) {
      throw new BlBadRequestException(CnErrorText.REMOVE_FOLDER_SYNC_EXPERIMENT_ERROR, { detailArgs: { count: syncExperiments.length } });
    }

    const syncReports = await this.folderAggregateService.getReportsByRootFolderAndLabInstance(rootFolderId, labInstanceId);
    if (syncReports.length > 0) {
      throw new BlBadRequestException(CnErrorText.REMOVE_FOLDER_SYNC_REPORT_ERROR, { detailArgs: { count: syncReports.length } });
    }

    await this.removeFolderFromLab(labInstance, rootFolderId);
  }

  private async removeFolderFromLab(labInstance: CnLabInstance, rootFolderId: string): Promise<void> {
    return await this.dataSource.transaction(async entityManager => {
      await this.labFolderService.deleteLabInstanceFolder(labInstance.id, rootFolderId, entityManager);

      // remove the folder from the lab, if it is available
      const labIsRunning = await this.externalLabApiService.healthCheck(labInstance.getGlabSpaceApiInfo());
      if (labIsRunning) {
        await this.externalLabFolderService.deleteFolderInLab(labInstance.getGlabSpaceApiInfo(), rootFolderId);
      }
    });
  }

  public async removeFolderFromAllLabs(rootFolderId: string): Promise<void> {
    const labFolders = await this.labFolderService.findByRootFolderId(rootFolderId);
    for (const labFolder of labFolders) {
      try {
        await this.removeFolderFromLab(labFolder.labInstance, rootFolderId);
      } catch (e) {
        throw new Error(`Error while removing folder from lab '${labFolder.labInstance.name}' : ${e}`);
      }
    }
  }

  public async getCurrentLabInstanceFolders(): Promise<CnHierarchyObject[]> {
    const labFolders = await this.labFolderService.findByLabInstanceId(CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);
    const folders = labFolders.map(labFolder => labFolder.rootFolder);
    return this.folderAggregateService.getFolderTrees(folders);
  }

  public async getCurrentLabInstanceRootFolderById(folderId: string): Promise<CnHierarchyObject> {
    const folder = await this.folderAggregateService.getFolderHierarchyNotSecure(folderId);
    const labFolder = await this.labFolderService.findByRootFolderIdAndLabInstanceId(folder.getRootFolderId(),
      CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);
    if (labFolder == null) {
      throw new BlBadRequestException(CnErrorText.FOLDER_NOT_SHARED_WITH_LAB);
    }

    return this.folderAggregateService.getFolderTree(labFolder.rootFolderId);
  }

  public async findLabFolderByFolderId(rootFolderId: string): Promise<CnLabFolderWithLab[]> {
    return this.labFolderService.findByRootFolderId(rootFolderId);
  }


  public async getLabInstanceFolders(labInstanceId: string): Promise<CnLabFolderWithRootFolder[]> {
    // get and check if the user can manage the lab
    await this.getAndCheckAuthorizationToFindLabById(labInstanceId);

    return this.labFolderService.findByLabInstanceId(labInstanceId);
  }

  public async getAndCheckAuthorizationToManageLab(id: string, refuseDesktop: boolean = true): Promise<CnLabInstance> {
    return this.labAggregateService.getAndCheckAuthorizationToManageLab(id, refuseDesktop);
  }

  public async getAndCheckAuthorizationToFindLabById(id: string, refuseDesktop: boolean = true): Promise<CnLabInstance> {
    return this.labAggregateService.getAndCheckAuthorizationToManageLab(id, refuseDesktop);
  }
}
