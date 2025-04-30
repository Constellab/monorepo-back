import { Injectable, Logger } from '@nestjs/common';
import { CnFolderAggregateService } from '../cn-folders-aggregate/cn-folder-aggregate.service';
import { CnLabAggregateService } from '../cn-labs/cn-lab-aggregate.service';
import { CnLabFolder, CnLabFolderWithLab, CnLabFolderWithRootFolder } from './cn-lab-folder.entity';
import { CnLab } from '../cn-labs/cn-lab.entity';
import { BlBadRequestException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnLabFolderService } from './cn-lab-folder.service';
import { DataSource } from 'typeorm';
import { CnExternalLabFolderService } from '../cn-external-lab-api/cn-external-lab-folder.service';
import { CnExternalLabApiService } from '../cn-external-lab-api/cn-external-lab-api.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import {
  CnHierarchyObject,
  CnHierarchyObjectWithChildren,
} from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnExternalLabShareService } from '../cn-external-lab-api/cn-external-lab-share.service';
import { CnResourceAccessDTO } from '../cn-folders-aggregate/cn-resources/cn-resource.dto';

@Injectable()
export class CnLabFolderAggregateService {
  private logger = new Logger(CnLabFolderAggregateService.name);

  constructor(
    private folderAggregateService: CnFolderAggregateService,
    private labAggregateService: CnLabAggregateService,
    private labFolderService: CnLabFolderService,
    private dataSource: DataSource,
    private externalLabFolderService: CnExternalLabFolderService,
    private externalLabApiService: CnExternalLabApiService,
    private externalLabShareService: CnExternalLabShareService
  ) {}

  public async addFolderToLab(labId: string, rootFolderId: string): Promise<CnLabFolder> {
    // get and check if the user can manage the lab
    const lab = await this.getAndCheckAuthorizationToManageLab(labId, false);

    return this.addRootFolderToLabInsecure(lab, rootFolderId);
  }

  public async addRootFolderToLabInsecure(lab: CnLab, rootFolderId: string): Promise<CnLabFolder> {
    // get and check if the user can see the folder
    const folderTree = await this.folderAggregateService.getFolderTree(rootFolderId);

    return await this.dataSource.transaction(async (entityManager) => {
      const labFolder = await this.labFolderService.createLabFolder(lab, folderTree, entityManager);
      await this.syncFolderToLab(lab, folderTree);

      return labFolder;
    });
  }

  public async forceFolderSyncToLab(labId: string, rootFolderId: string): Promise<void> {
    const labFolder = await this.labFolderService.findByRootFolderId(rootFolderId);
    if (labFolder == null) throw new BlUnauthorizedException();

    const labManager = await this.getAndCheckAuthorizationToManageLab(labId);

    const folderTree = await this.folderAggregateService.getFolderTree(rootFolderId);
    await this.syncFolderToLab(labManager, folderTree);
  }

  public async syncFolderToLab(lab: CnLab, folderTree: CnHierarchyObjectWithChildren): Promise<void> {
    // add the user to the lab is the lab is running
    const labIsRunning = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());
    if (labIsRunning) {
      const glabConfig = await this.labAggregateService.getGlabConfig(lab);
      // add the folder to the lab
      await this.externalLabFolderService.addFolderInLab(glabConfig, folderTree);
    }
  }

  public async syncAllFolderInsecure(lab: CnLab): Promise<void> {
    const labIsRunning = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());
    if (!labIsRunning) {
      return;
    }

    const labFolders = await this.labFolderService.findByLabId(lab.id);

    const folders = labFolders.map((labFolder) => labFolder.rootFolder);
    const rootFoldersWithChildren = await this.folderAggregateService.getFolderTrees(folders);
    const glabConfig = await this.labAggregateService.getGlabConfig(lab);

    await this.externalLabFolderService.syncAllFoldersInLab(glabConfig, rootFoldersWithChildren);
  }

  public async checkAndRemoveFolderFromLab(labId: string, rootFolderId: string): Promise<void> {
    // get and check if the user can manage the lab
    const lab = await this.getAndCheckAuthorizationToManageLab(labId);

    // check if the folder  uses the lab as storage (datahub)
    if (await this.folderAggregateService.folderUsesLabStorage(rootFolderId, labId)) {
      throw new BlBadRequestException(CnErrorText.REMOVE_FOLDER_USE_LAB_AS_STORAGE_ERROR);
    }

    // Before delete folder from lab, check if this folder as sync object from this lab
    const syncScenarios = await this.folderAggregateService.getScenariosByRootFolderAndLabNotSecure(
      rootFolderId,
      labId
    );
    if (syncScenarios.length > 0) {
      throw new BlBadRequestException(CnErrorText.REMOVE_FOLDER_SYNC_SCENARIO_ERROR, {
        detailArgs: { count: syncScenarios.length },
      });
    }

    const syncNotes = await this.folderAggregateService.getNotesByRootFolderAndLab(rootFolderId, labId);
    if (syncNotes.length > 0) {
      throw new BlBadRequestException(CnErrorText.REMOVE_FOLDER_SYNC_NOTE_ERROR, {
        detailArgs: { count: syncNotes.length },
      });
    }

    await this.removeFolderFromLab(lab, rootFolderId);
  }

  private async removeFolderFromLab(lab: CnLab, rootFolderId: string): Promise<void> {
    return await this.dataSource.transaction(async (entityManager) => {
      await this.labFolderService.deleteLabFolder(lab.id, rootFolderId, entityManager);

      // remove the folder from the lab, if it is available
      const labIsRunning = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());
      if (labIsRunning) {
        const glabConfig = await this.labAggregateService.getGlabConfig(lab);
        await this.externalLabFolderService.deleteFolderInLab(glabConfig, rootFolderId);
      }
    });
  }

  public async removeFolderFromAllLabs(rootFolderId: string): Promise<void> {
    const labFolders = await this.labFolderService.findByRootFolderId(rootFolderId);
    for (const labFolder of labFolders) {
      try {
        await this.removeFolderFromLab(labFolder.lab, rootFolderId);
      } catch (e) {
        throw new Error(`Error while removing folder from lab '${labFolder.lab.name}' : ${e}`);
      }
    }
  }

  public async getCurrentLabFolders(): Promise<CnHierarchyObject[]> {
    const labFolders = await this.labFolderService.findByLabId(
      CnCurrentUserHelper.getAndCheckCurrentLab().id
    );
    const folders = labFolders.map((labFolder) => labFolder.rootFolder);
    return this.folderAggregateService.getFolderTrees(folders);
  }

  public async getCurrentLabRootFolderById(folderId: string): Promise<CnHierarchyObject> {
    const folder = await this.folderAggregateService.getFolderHierarchyNotSecure(folderId);
    const labFolder = await this.labFolderService.findByRootFolderIdAndLabId(
      folder.getRootFolderId(),
      CnCurrentUserHelper.getAndCheckCurrentLab().id
    );
    if (labFolder == null) {
      throw new BlBadRequestException(CnErrorText.FOLDER_NOT_SHARED_WITH_LAB);
    }

    return this.folderAggregateService.getFolderTree(labFolder.rootFolderId);
  }

  public async findLabFolderByFolderId(rootFolderId: string): Promise<CnLabFolderWithLab[]> {
    return this.labFolderService.findByRootFolderId(rootFolderId);
  }

  public async findLabFolderByFolderIds(rootFolderIds: string[]): Promise<CnLabFolderWithLab[]> {
    return this.labFolderService.findByRootFolderIds(rootFolderIds);
  }

  public async getLabFolders(labId: string): Promise<CnLabFolderWithRootFolder[]> {
    // get and check if the user can manage the lab
    await this.getAndCheckAuthorizationToFindLabById(labId);

    return this.labFolderService.findByLabId(labId);
  }

  public async getAndCheckAuthorizationToManageLab(
    id: string,
    refuseDesktop: boolean = true
  ): Promise<CnLab> {
    return this.labAggregateService.getAndCheckAuthorizationToManageLab(id, refuseDesktop);
  }

  public async getAndCheckAuthorizationToFindLabById(id: string): Promise<CnLab> {
    return this.labAggregateService.getAndCheckAuthorizationToFindById(id);
  }

  /////////////////////////////////////// RESOURCE //////////////////////////////////

  /**
   * Method that calls the lab to generate a user access token for a resource
   * @param resourceId
   */
  public async getResourceAccess(resourceId: string): Promise<CnResourceAccessDTO> {
    const resource = await this.folderAggregateService.findResource(resourceId);
    const lab = resource.lab;

    // Check that the lab is running
    const check = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());

    if (!check) {
      throw new BlBadRequestException(
        `The lab '${lab.name}' is not running, please start it or transfer the ` +
          `resource to a permanent lab.`
      );
    }

    // Call the lab to generate the user access token
    const labUser = await this.labAggregateService.getUserInfoForLab(
      CnCurrentUserHelper.getAndCheckCurrentUser().id,
      lab.id
    );

    const userAccess = await this.externalLabShareService.generateUserAccessToken(
      lab.getGlabSpaceApiInfo(),
      resource.token,
      labUser
    );
    return new CnResourceAccessDTO(resource, userAccess.access_url, userAccess.valid_until);
  }
}
