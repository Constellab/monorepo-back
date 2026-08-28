import { BlBadRequestException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnExternalLabApiService } from '../cn-external-lab-api/cn-external-lab-api.service';
import { CnExternalLabFolderService } from '../cn-external-lab-api/cn-external-lab-folder.service';
import { CnExternalLabObjectService } from '../cn-external-lab-api/cn-external-lab-object.service';
import { CnExternalLabShareService } from '../cn-external-lab-api/cn-external-lab-share.service';
import { CnExternalLabSyncedObjectDTO } from '../cn-external-lab-api/model/cn-external-lab-api.class';
import { CnFolderAggregateService } from '../cn-folders-aggregate/cn-folder-aggregate.service';
import { CnHierarchyObjectWithChildren } from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnNoteAggregateService } from '../cn-folders-aggregate/cn-notes/cn-note-aggregate.service';
import { CnResourceAccessDTO } from '../cn-folders-aggregate/cn-resources/cn-resource.dto';
import { CnResourceAggregateService } from '../cn-folders-aggregate/cn-resources/cn-resource-aggregate.service';
import { CnScenarioAggregateService } from '../cn-folders-aggregate/cn-scenarios/cn-scenario-aggregate.service';
import { CnLabGlabApiInfo } from '../cn-labs/cn-lab.dto';
import { CnLab } from '../cn-labs/cn-lab.entity';
import { CnLabAggregateService } from '../cn-labs/cn-lab-aggregate.service';
import { CnLabFolder, CnLabFolderWithLab, CnLabFolderWithRootFolder } from './cn-lab-folder.entity';
import { CnLabFolderService } from './cn-lab-folder.service';

@Injectable()
export class CnLabFolderAggregateService {
  constructor(
    private folderAggregateService: CnFolderAggregateService,
    private labAggregateService: CnLabAggregateService,
    private labFolderService: CnLabFolderService,
    private dataSource: DataSource,
    private externalLabFolderService: CnExternalLabFolderService,
    private externalLabApiService: CnExternalLabApiService,
    private externalLabShareService: CnExternalLabShareService,
    private externalLabObjectService: CnExternalLabObjectService,
    private scenarioAggregateService: CnScenarioAggregateService,
    private noteAggregateService: CnNoteAggregateService,
    private resourceAggregateService: CnResourceAggregateService
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
    const glabConfig = await this.getAndCheckGlabConfig(lab);
    if (glabConfig) {
      // add the folder to the lab
      await this.externalLabFolderService.addFolderInLab(glabConfig, folderTree);
    }
  }

  public async syncAllFolderInsecure(lab: CnLab): Promise<void> {
    const glabConfig = await this.getAndCheckGlabConfig(lab);
    if (!glabConfig) {
      return;
    }

    const labFolders = await this.labFolderService.findByLabId(lab.id);

    const folders = labFolders.map((labFolder) => labFolder.rootFolder);
    const rootFoldersWithChildren = await this.folderAggregateService.getFolderTrees(folders);

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
    const syncScenarios = await this.scenarioAggregateService.getScenariosByRootFolderAndLabNotSecure(
      rootFolderId,
      labId
    );
    if (syncScenarios.length > 0) {
      throw new BlBadRequestException(CnErrorText.REMOVE_FOLDER_SYNC_SCENARIO_ERROR, {
        detailArgs: { count: syncScenarios.length },
      });
    }

    const syncNotes = await this.noteAggregateService.getNotesByRootFolderAndLab(rootFolderId, labId);
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
      } catch (e: any) {
        throw new Error(`Error while removing folder from lab '${labFolder.lab.name}' : ${e}`, { cause: e });
      }
    }
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

  /////////////////////////////////////// SCENARIO //////////////////////////////////

  public async syncScenarioToLab(scenarioId: string): Promise<void> {
    const scenarioWithLab = await this.scenarioAggregateService.getScenarioSyncLabDTO(scenarioId);
    if (scenarioWithLab == null) return;

    const glabConfig = await this.getAndCheckGlabConfig(scenarioWithLab.lab);
    if (!glabConfig) return;

    const scenarioParentId = scenarioWithLab.hierarchyRepresentation.parentId;
    if (scenarioParentId == null) {
      throw new BlBadRequestException('The scenario to sync must have a parent folder');
    }

    await this.externalLabObjectService.syncScenarioWithLab(
      glabConfig,
      new CnExternalLabSyncedObjectDTO(
        scenarioWithLab.id,
        scenarioParentId,
        scenarioWithLab.lastSyncAt,
        scenarioWithLab.lastSyncBy.id
      )
    );
  }

  /////////////////////////////////////// NOTE //////////////////////////////////

  public async syncNoteToLab(noteId: string): Promise<void> {
    const noteWithLab = await this.noteAggregateService.getNoteSyncLabDTO(noteId);
    if (noteWithLab == null) return;

    const glabConfig = await this.getAndCheckGlabConfig(noteWithLab.lab);
    if (!glabConfig) return;

    const noteParentId = noteWithLab.hierarchyRepresentation.parentId;
    if (noteParentId == null) {
      throw new BlBadRequestException('The note to sync must have a parent folder');
    }

    await this.externalLabObjectService.syncNoteWithLab(
      glabConfig,
      new CnExternalLabSyncedObjectDTO(
        noteWithLab.id,
        noteParentId,
        noteWithLab.lastSyncAt,
        noteWithLab.lastSyncBy.id
      )
    );
  }

  /////////////////////////////////////// RESOURCE //////////////////////////////////

  /**
   * Method that calls the lab to generate a user access token for a resource.
   *
   * Returns an embedded url (open in place) and a standalone url (open in a new
   * tab through the launcher gateway). Legacy labs return a single access_url
   * that is used for both.
   * @param resourceId
   */
  public async getResourceAccess(resourceId: string): Promise<CnResourceAccessDTO> {
    const resource = await this.resourceAggregateService.findResource(resourceId);
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
      lab,
      resource.token,
      labUser
    );

    // Recent labs return embedded_url/standalone_url. Legacy labs return a single
    // access_url used for both.
    const embeddedUrl = userAccess.embedded_url ?? userAccess.access_url;
    const standaloneUrl = userAccess.standalone_url ?? userAccess.access_url;
    if (embeddedUrl == null || standaloneUrl == null) {
      throw new BlBadRequestException(
        `The lab '${lab.name}' did not return a valid access url for the resource.`
      );
    }
    return new CnResourceAccessDTO(resource, embeddedUrl, standaloneUrl, userAccess.share_link_valid_until);
  }

  /////////////////////////////////////// OTHER //////////////////////////////////

  /**
   * Method that check if the lab is running and get the glab config if it is
   * @param lab
   */
  public async getAndCheckGlabConfig(lab: CnLab): Promise<CnLabGlabApiInfo | null> {
    const labIsRunning = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());
    if (!labIsRunning) {
      return null;
    }

    return await this.labAggregateService.getGlabConfig(lab);
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

  //////////////////////////////////////// CURRENT LAB ///////////////////////////////////

  public async getCurrentLabFolders(): Promise<CnHierarchyObjectWithChildren[]> {
    const labFolders = await this.labFolderService.findByLabId(
      CnCurrentUserHelper.getAndCheckCurrentLab().id
    );
    const folders = labFolders.map((labFolder) => labFolder.rootFolder);
    return this.folderAggregateService.getFolderTrees(folders);
  }

  public async getCurrentLabRootFolderById(folderId: string): Promise<CnHierarchyObjectWithChildren> {
    const folder = await this.folderAggregateService.getFolderHierarchyObject(folderId);
    const labFolder = await this.labFolderService.findByRootFolderIdAndLabId(
      folder.getRootFolderId(),
      CnCurrentUserHelper.getAndCheckCurrentLab().id
    );
    if (labFolder == null) {
      throw new BlBadRequestException(CnErrorText.FOLDER_NOT_SHARED_WITH_LAB);
    }

    return this.folderAggregateService.getFolderTree(labFolder.rootFolderId);
  }

  public async shareFolderWithCurrentLab(rootFolderId: string): Promise<CnHierarchyObjectWithChildren> {
    const lab = CnCurrentUserHelper.getAndCheckCurrentLab();

    await this.addRootFolderToLabInsecure(lab, rootFolderId);

    return this.folderAggregateService.getFolderTree(rootFolderId);
  }
}
