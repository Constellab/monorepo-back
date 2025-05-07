import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CnFoldersService } from './cn-folders/cn-folders.service';
import { CnFoldersSecurityService } from './cn-folders-security.service';
import { CnFolder, CnFolderEntity, CnFolderWithHierarchy } from './cn-folders/cn-folder.entity';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { ClHelpService, ClPage, ClPageI } from '@monorepo/core-lib';
import { CnScenariosService } from './cn-scenarios/cn-scenarios.service';
import { CnNotesService } from './cn-notes/cn-notes.service';
import { CnScenario } from './cn-scenarios/cn-scenario.entity';
import { CnCreateLabScenarioDto } from './cn-scenarios/cn-scenario.dto';
import { CnCreateNoteWithConfigDto } from './cn-notes/cn-note.dto';
import { CnNote } from './cn-notes/cn-note.entity';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';
import {
  CnFolderStorageLocationDTO,
  CnGetFolderDescriptionDTO,
  CnSaveFolderDTO,
} from './cn-folders/cn-folder.dto';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnChatMessage, getFakeUserEveryoneMention } from '../cn-chat-message/cn-chat-message.entity';
import { CnChatMessageService } from '../cn-chat-message/cn-chat-message.service';
import { CnNewMessageDTO } from '../cn-core/model/entities/cn-message.entity';
import {
  BlBadRequestException,
  BlFile,
  BlFileResponse,
  BlSearchBuilder,
  BlSearchParams,
} from '@monorepo/back-core-lib';
import { DataSource, In } from 'typeorm';
import { CnFolderBucketService } from './cn-folders/cn-folder-bucket.service';
import { CnFolderUserService } from './cn-folder-user/cn-folder-user.service';
import { CnUsersService } from '../cn-users/cn-users.service';
import { CnFolderUser } from './cn-folder-user/cn-folder-user.entity';
import {
  CnFolderEvent,
  CnFolderEventMoveFolderData,
  cnFolderEventName,
  CnFolderEventType,
  cnRemoveFolderFromAllLabsEventName,
} from './cn-folder.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CnActivity, CnActivityEntityType } from '../cn-activity/cn-activity.entity';
import { CnActivityService } from '../cn-activity/cn-activity.service';
import { CnBucketLocationDTO } from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnDocumentService } from './cn-documents/cn-document.service';
import { CnDocument, CnDocumentType } from './cn-documents/cn-document.entity';
import {
  CnConstellabDocumentDTO,
  CnDocumentPreviewDTO,
  CnFolderStorageUsageDTO,
} from './cn-documents/cn-document-dto.class';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
  CnHierarchyObjectType,
  CnHierarchyObjectWithChildren,
  CnHierarchyObjectWithParent,
} from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from './cn_hierarchy_objects/cn-hierarchy-object.service';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeRichText,
  TeRichTextBlockModificationWithUser,
} from '@monorepo/te-text-editor';
import { CnShareResourceRequestDTO } from './cn-resources/cn-resource.dto';
import { CnResourcesService } from './cn-resources/cn-resources.service';
import { CnResource, CnResourceWithLab } from './cn-resources/cn-resource.entity';
import { CnScenarioProtocol } from './cn-scenarios/cn-scenario-protocol.class';
import { CnAvailableTags, CnTag } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';
import { CnHierarchyObjectTagAggregateService } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag-aggregate.service';
import { CnHierarchyObjectTag } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag.entity';
import { CnSpaceAggregateService } from '../cn-spaces/cn-space-aggregate.service';

@Injectable()
export class CnFolderAggregateService {
  protected readonly logger = new Logger(CnFolderAggregateService.name);

  constructor(
    private foldersService: CnFoldersService,
    private hierarchyObjectService: CnHierarchyObjectService,
    private foldersAggregateSecurity: CnFoldersSecurityService,
    private scenarioService: CnScenariosService,
    private noteService: CnNotesService,
    private chatMessageService: CnChatMessageService,
    private datasource: DataSource,
    private folderBucketService: CnFolderBucketService,
    private documentService: CnDocumentService,
    private folderUserService: CnFolderUserService,
    private userService: CnUsersService,
    private eventEmitter: EventEmitter2,
    private activityService: CnActivityService,
    private resourceService: CnResourcesService,
    private tagService: CnHierarchyObjectTagAggregateService,
    private spaceAggregateService: CnSpaceAggregateService
  ) {}

  /////////////////////////////////////// FOLDER //////////////////////////////////

  async createRootFolder(folderDTO: CnSaveFolderDTO): Promise<CnFolderWithHierarchy> {
    const newFolder = await this.datasource.transaction(async (manager) => {
      const entity = this.createFolderFromDTO(folderDTO);

      entity.leader = CnCurrentUserHelper.getAndCheckCurrentUser();
      entity.style = CnFolderEntity.ROOT_FOLDER_STYLE;
      entity.hierarchyRepresentation = CnHierarchyObjectEntity.newRootFolderHierarchy(
        CnCurrentUserHelper.getAndCheckCurrentSpace(),
        entity.getHierarchyObjectInfo(),
        folderDTO.tags
      );

      if (folderDTO.mainStorage) {
        entity.mainStorage = await this.folderBucketService.getBucketById(folderDTO.mainStorage.bucketId);

        if (folderDTO.backupStorage) {
          entity.backupStorage = await this.folderBucketService.getBucketById(
            folderDTO.backupStorage.bucketId
          );

          if (entity.mainStorage.bucketType !== entity.backupStorage.bucketType) {
            throw new BlBadRequestException('Main and backup storage must have the same type (cloud or lab)');
          }
        }
      } else {
        // if the main storage is not set, we use the default storage of the space
        const space = await this.spaceAggregateService.getCurrentSpace();
        entity.mainStorage = space.defaultFolderBucket;
        entity.backupStorage = space.defaultFolderBackupBucket;
      }
      const dbFolder = await this.foldersService.create(entity, manager);

      // share the folder with the leader
      await this.folderUserService.shareRootFolderToUserIfNot(dbFolder.id, dbFolder.leader.id, manager);

      if (folderDTO.tags?.length > 0) {
        await this.tagService.createTagsTransaction(
          folderDTO.tags,
          dbFolder.hierarchyRepresentation,
          manager
        );
      }

      return dbFolder;
    });

    this.emitFolderEvent('CREATE_ROOT_FOLDER', null, newFolder);
    return this.foldersService.findByIdAndCheckWithFolder(newFolder.id);
  }

  async createSubFolder(folderDto: CnSaveFolderDTO, parentFolderId: string): Promise<CnFolderWithHierarchy> {
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);
    const newFolder = await this.createSubFolderPrivate(folderDto, parentFolder);

    this.emitFolderEvent('CREATE_SUB_FOLDER', parentFolder, newFolder);
    return this.foldersService.findByIdAndCheckWithFolder(newFolder.id);
  }

  /**
   * Create the sub folder but does not check the authorization or emit event
   * @param folderDTO
   * @param parentFolder
   * @private
   */
  private async createSubFolderPrivate(
    folderDTO: CnSaveFolderDTO,
    parentFolder: CnHierarchyObject
  ): Promise<CnFolderWithHierarchy> {
    const entity = this.createFolderFromDTO(folderDTO);
    entity.leader = CnCurrentUserHelper.getAndCheckCurrentUser();
    entity.style = CnFolderEntity.CHILD_FOLDER_STYLE;

    const parentWithStorage = await this.foldersService.findByIfAndCheckWithStorage(parentFolder.id);

    if (
      entity.endingDate &&
      parentWithStorage.endingDate &&
      entity.endingDate > parentWithStorage.endingDate
    ) {
      throw new BlBadRequestException(CnErrorText.CHILD_FOLDER_END_DATA_AFTER_PARENT);
    }

    entity.hierarchyRepresentation = CnHierarchyObjectEntity.newSubHierarchyObject(
      parentFolder,
      entity.getHierarchyObjectInfo(),
      folderDTO.tags
    );

    return this.datasource.transaction(async (manager) => {
      const dbFolder = await this.foldersService.create(entity, manager);

      if (folderDTO.tags?.length > 0) {
        await this.tagService.createTagsTransaction(
          folderDTO.tags,
          dbFolder.hierarchyRepresentation,
          manager
        );
      }

      return dbFolder;
    });
  }

  private createFolderFromDTO(folderDto: CnSaveFolderDTO): CnFolderEntity {
    const folder = new CnFolderEntity();
    folder.name = folderDto.name;
    folder.code = folderDto.code;
    folder.startingDate = folderDto.startingDate;
    folder.endingDate = folderDto.endingDate;
    return folder;
  }

  async updateFolder(id: string, entity: CnSaveFolderDTO): Promise<CnFolderWithHierarchy> {
    const folder = await this.getAndCheckAuthorizationForUpdate(id);
    const dbFolder = await this.foldersService.findByIdAndCheck(id);

    // check that the ending date is not after the parent ending date
    if (entity.endingDate && folder.parentId) {
      const parent = await this.foldersService.findByIdAndCheck(folder.parentId);
      if (parent.endingDate && entity.endingDate > parent.endingDate) {
        throw new BlBadRequestException(CnErrorText.CHILD_FOLDER_END_DATA_AFTER_PARENT);
      }
    }

    dbFolder.name = entity.name;
    dbFolder.code = entity.code;
    dbFolder.startingDate = entity.startingDate;
    dbFolder.endingDate = entity.endingDate;

    const newFolder = await this.foldersService.update(dbFolder as CnFolderEntity);
    this.emitFolderEvent('UPDATE_FOLDER', null, newFolder);
    return this.foldersService.findByIdAndCheckWithFolder(newFolder.id);
  }

  async renameFolder(id: string, name: string): Promise<CnFolderWithHierarchy> {
    await this.getAndCheckAuthorizationForUpdate(id);
    const dbFolder = await this.foldersService.findByIdAndCheck(id);

    dbFolder.name = name;

    const newFolder = await this.foldersService.update(dbFolder as CnFolderEntity);
    this.emitFolderEvent('UPDATE_FOLDER', null, newFolder);
    return this.foldersService.findByIdAndCheckWithFolder(newFolder.id);
  }

  async deleteFolder(id: string): Promise<void> {
    const folderHierarchy = await this.getAndCheckAuthorizationForUpdate(id);

    const children = await this.hierarchyObjectService.getDirectChildren(folderHierarchy.id);

    if (children.find((child) => child.objectType === CnHierarchyObjectType.FOLDER)) {
      throw new BlBadRequestException(CnErrorText.DELETE_FOLDER_WITH_CHILDREN);
    }

    if (children.find((child) => child.objectType === CnHierarchyObjectType.SCENARIO)) {
      throw new BlBadRequestException(CnErrorText.DELETE_FOLDER_WITH_SCENARIOS);
    }

    if (children.find((child) => child.objectType === CnHierarchyObjectType.NOTE)) {
      throw new BlBadRequestException(CnErrorText.DELETE_FOLDER_WITH_NOTES);
    }

    if (
      children.find(
        (child) =>
          child.isVisible &&
          [CnHierarchyObjectType.DOCUMENT, CnHierarchyObjectType.CONSTELLAB_DOCUMENT].includes(
            child.objectType
          )
      )
    ) {
      throw new BlBadRequestException(CnErrorText.DELETE_FOLDER_WITH_DOCUMENTS);
    }

    // remove folder from all lab using event to avoid circular dependencies.
    // If the user can delete the folder, we consider he can remove it from labs
    if (folderHierarchy.isRootFolder()) {
      const results: string[] = await this.eventEmitter.emitAsync(
        cnRemoveFolderFromAllLabsEventName,
        folderHierarchy
      );
      // if a text is returned, it means an error occurred
      for (const res of results) {
        if (res) {
          throw new BlBadRequestException(res);
        }
      }
    }

    // delete all the trashed and hidden documents, no transaction because we can't revert between 2 docs
    const trashedDocuments = await this.documentService.findRootDocumentsByParentFolder(folderHierarchy.id);
    for (const document of trashedDocuments) {
      await this.documentService.deleteDocument(document.id);
    }

    await this.datasource.transaction(async (entityManager) => {
      await this.chatMessageService.deleteByFolderId(id, entityManager);
      await this.foldersService.deleteById(id, entityManager);
      await this.hierarchyObjectService.deleteById(id, entityManager);
    });

    this.emitFolderEvent('DELETE_FOLDER', null, folderHierarchy);
  }

  async findFolder(id: string): Promise<CnFolder> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(id);
    return this.foldersService.findByIdAndCheck(id);
  }

  public async getCurrentRootFolders(page: number, size: number): Promise<ClPageI<CnHierarchyObject>> {
    return this.hierarchyObjectService.getRootFoldersOfUser(
      CnCurrentUserHelper.getAndCheckCurrentUser().id,
      CnCurrentUserHelper.getAndCheckCurrentSpace().id,
      page,
      size
    );
  }

  public async searchRootFolders(
    searchParams: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    return this.hierarchyObjectService.searchRootFolders(
      CnCurrentUserHelper.getAndCheckCurrentUser().id,
      CnCurrentUserHelper.getAndCheckCurrentSpace().id,
      searchParams,
      page,
      size
    );
  }

  public async getAllCurrentRootFolders(): Promise<CnHierarchyObject[]> {
    return this.hierarchyObjectService.getAllRootFoldersOfUser(
      CnCurrentUserHelper.getAndCheckCurrentUser().id,
      CnCurrentUserHelper.getAndCheckCurrentSpace().id
    );
  }

  public async getByCurrentSpace(page: number, size: number): Promise<ClPageI<CnHierarchyObject>> {
    const spaceId = CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    await this.foldersAggregateSecurity.checkFindAllBySpace();
    return this.hierarchyObjectService.getRootFoldersBySpace(spaceId, page, size);
  }

  public async searchInCurrentSpace(
    searchParams: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPageI<CnFolder>> {
    const spaceId = CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    await this.foldersAggregateSecurity.checkFindAllBySpace();
    return this.foldersService.searchFolderInSpace(spaceId, searchParams, page, size);
  }

  public async getChildrenFolders(folderId: string): Promise<CnHierarchyObject[]> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    return await this.hierarchyObjectService.getChildrenFolder(folderId);
  }

  public async getFolderTree(rootFolderId: string): Promise<CnHierarchyObjectWithChildren> {
    const folder = await this.hierarchyObjectService.findByIdAndCheck(rootFolderId);
    return this.hierarchyObjectService.getFolderTree(folder);
  }

  /**
   * Method not secured to get a list of folder trees
   * @param rootFolders
   */
  public async getFolderTrees(rootFolders: CnHierarchyObject[]): Promise<CnHierarchyObjectWithChildren[]> {
    const folderTrees = rootFolders.map((folder) => this.hierarchyObjectService.getFolderTree(folder));
    return await Promise.all(folderTrees);
  }

  public async getFolderDirectChildren(folderId: string): Promise<CnHierarchyObject[]> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    return this.hierarchyObjectService.getDirectChildren(folder.id);
  }

  public async getChildrenPaginated(
    folderId: string,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    return this.hierarchyObjectService.searchVisibleChildren(folder.id, searchParam, page, size);
  }

  public async searchInRootFoldersAndChildren(
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObjectWithParent>> {
    const spaceId = CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    const rootFolders = await this.hierarchyObjectService.getAllRootFoldersOfUser(
      CnCurrentUserHelper.getAndCheckCurrentUser().id,
      spaceId
    );
    return this.hierarchyObjectService.searchVisibleInRootFoldersAndChildren(
      rootFolders.map((folder) => folder.id),
      spaceId,
      searchParam,
      page,
      size
    );
  }

  public async getFolderAncestors(folderId: string): Promise<CnHierarchyObject[]> {
    // retrieve the folder ancestors
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);
    return await this.hierarchyObjectService.getAncestors(folder);
  }

  public async getHierarchyObject(hierarchyObjectId: string): Promise<CnHierarchyObject> {
    return this.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
  }

  public async updateFolderLeader(folderId: string, userId: string): Promise<CnFolder> {
    const folderHierarchy = await this.hierarchyObjectService.findByIdAndCheck(folderId);

    // check if the current user has the authorization to update the leader
    await this.foldersAggregateSecurity.checkUpdateFolderLeader(folderHierarchy);

    const newLeader = await this.userService.findByIdAndCheck(userId);
    await this.datasource.transaction(async (entityManager) => {
      // the group must be shared with the new leader single group
      // so if it is not shared, we add it
      await this.folderUserService.shareRootFolderToUserIfNot(
        folderHierarchy.getRootFolderId(),
        userId,
        entityManager
      );

      await this.foldersService.updateLeader(folderHierarchy.id, newLeader, entityManager);
    });

    const folder = await this.foldersService.findByIdAndCheck(folderId);
    this.emitFolderEvent('UPDATE_FOLDER_LEADER', folderHierarchy, folder);
    return folder;
  }

  public async moveFolder(folderId: string, newParentFolderId: string): Promise<CnHierarchyObject> {
    if (folderId === newParentFolderId) {
      throw new BlBadRequestException('The folder can not be moved to itself');
    }

    const hierarchyObject = await this.getAndCheckAuthorizationForUpdate(folderId);
    const oldParentRootFolderId: string = hierarchyObject.getRootFolderId();
    const newParentHierarchyObject =
      await this.getAndCheckAuthorizationForFindOneByHierarchyObject(newParentFolderId);

    if (hierarchyObject.parentId === newParentHierarchyObject.id) {
      throw new BlBadRequestException('The folder already belong to this folder');
    }

    const children = await this.hierarchyObjectService.findChildrenByNameAndType(
      newParentHierarchyObject.id,
      hierarchyObject.name,
      CnHierarchyObjectType.FOLDER
    );
    if (children.length > 0) {
      throw new BlBadRequestException(
        `A folder with the name '${hierarchyObject.name}' already exist in the destination folder` +
          ` '${newParentHierarchyObject.name}'`
      );
    }

    // check if the new parent is not a current child of the folder
    const ancestor = await this.hierarchyObjectService.getAncestors(newParentHierarchyObject);
    if (ancestor.find((descendant) => descendant.id === hierarchyObject.id)) {
      throw new BlBadRequestException('The destination folder cannot be a child of the moved folder');
    }

    // check that the source root folder and the destination root folder are using the same bucket configs
    const folderToMoveBuckets = await this.folderBucketService.getAndCheckFolderBucketConfig(
      hierarchyObject.getRootFolderId()
    );
    const newParentBuckets = await this.folderBucketService.getAndCheckFolderBucketConfig(
      newParentHierarchyObject.getRootFolderId()
    );

    if (!folderToMoveBuckets.equals(newParentBuckets)) {
      throw new BlBadRequestException(
        `The folder '${hierarchyObject.name}' can not be moved to the folder ` +
          `'${newParentHierarchyObject.name}' because they use different storage location.` +
          ` Please move folder objects manually.`
      );
    }

    await this.datasource.transaction(async (entityManager) => {
      await this.hierarchyObjectService.updateFolderParent(
        hierarchyObject,
        newParentHierarchyObject,
        entityManager
      );
    });

    const data: CnFolderEventMoveFolderData = {
      hierarchyObject,
      newParentFolder: newParentHierarchyObject,
      oldParentRootFolderId: oldParentRootFolderId,
    };
    this.emitFolderEvent('MOVE_FOLDER', newParentHierarchyObject, data);
    return this.hierarchyObjectService.findByIdAndCheck(hierarchyObject.id);
  }

  /////////////////////////////////////// FOLDER HIERARCHY //////////////////////////////////

  public async getFolderHierarchyNotSecure(id: string): Promise<CnHierarchyObject> {
    return this.hierarchyObjectService.findByIdAndCheck(id);
  }

  /////////////////////////////////////// FOLDER DESCRIPTION //////////////////////////////////

  public async getDescription(folderId: string): Promise<CnGetFolderDescriptionDTO> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);
    const description = await this.foldersService.getDescription(folderId);

    return {
      description: description.toJson(),
      canEdit: this.foldersAggregateSecurity.isFolderLeader(folder),
    };
  }

  public async updateDescription(folderId: string, description: TeRichText): Promise<void> {
    const folder = await this.getAndCheckAuthorizationForUpdate(folderId);
    await this.foldersService.updateDescription(folderId, description);

    // update the folder object to set the hasDescription flag
    folder.hasDescription = !description.isEmpty();
    await this.hierarchyObjectService.update(folder as CnHierarchyObjectEntity);

    // for this event we send the description
    this.emitFolderEvent('UPDATE_FOLDER_DESCRIPTION', null, description);
  }

  public async saveDescriptionImage(folderId: string, file: BlFile): Promise<TeBlockFigureUploadedResponse> {
    const folder = await this.getAndCheckAuthorizationForUpdate(folderId);

    return this.documentService.uploadImageDocument(
      file,
      folder,
      CnDocumentType.DESCRIPTION_CONTENT,
      folder.id
    );
  }

  public async getDescriptionImage(folderId: string, filename: string): Promise<BlFileResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    return this.documentService.getDocumentContentByTypeAndName(
      folder.getRootFolderId(),
      CnDocumentType.DESCRIPTION_CONTENT,
      filename,
      folderId
    );
  }

  /////////////////////////////////////// SCENARIO //////////////////////////////////

  public async findScenario(id: string): Promise<CnScenario> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(id);
    return await this.scenarioService.findByIdAndCheck(id);
  }

  async getScenariosByFolder(folderId: string): Promise<CnScenario[]> {
    // check that the user can get the folder
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    return this.scenarioService.getScenariosByParentFolder(folder.id);
  }

  async getScenariosAssociatedToNotes(noteId: string): Promise<CnScenario[]> {
    // check that the user can get the folder
    await this.findNote(noteId);

    return (await this.noteService.findByIdAndCheckWithScenarios(noteId)).scenarios;
  }

  async createLabScenario(
    parentFolderId: string,
    createLabScenarioDto: CnCreateLabScenarioDto
  ): Promise<void> {
    // check that the user can get the folder
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);

    const result = await this.scenarioService.saveLabScenario(parentFolder, createLabScenarioDto);

    if (result.mode === 'create') {
      this.emitFolderEvent('CREATE_SCENARIO', parentFolder, result.scenario);
    } else {
      this.emitFolderEvent('UPDATE_SCENARIO', parentFolder, result.scenario);
    }
  }

  async deleteLabScenario(parentFolderId: string, scenarioId: string): Promise<void> {
    // check that the user can get the folder
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);

    // check if the scenario has associated notes
    const expWithNotes = await this.scenarioService.findByIdAndCheckWithNotes(scenarioId);
    if (expWithNotes.notes.length > 0) {
      throw new BlBadRequestException(
        'The scenario has associated notes in the space, please delete the note first.'
      );
    }

    let scenario: CnScenario;
    await this.datasource.transaction(async (entityManager) => {
      scenario = await this.scenarioService.deleteScenario(scenarioId, entityManager);
      await this.hierarchyObjectService.deleteById(scenarioId, entityManager);
    });
    if (scenario) {
      this.emitFolderEvent('DELETE_SCENARIO', parentFolder, scenario);
    }
  }

  async findScenarioTechnicalReport(scenarioId: string): Promise<CnScenarioProtocol> {
    return (await this.findScenario(scenarioId)).protocol;
  }

  async findScenarioLabConfig(scenarioId: string): Promise<CnLabConfig> {
    return this.scenarioService.getScenarioLabConfig(scenarioId);
  }

  public async getScenariosByRootFolderAndLabNotSecure(
    rootFolderId: string,
    labId: string
  ): Promise<CnScenario[]> {
    return this.scenarioService.getScenariosByRootFolderAndLab(rootFolderId, labId);
  }

  public async updateScenarioFolder(scenarioId: string, newParentFolderId: string): Promise<CnScenario> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(scenarioId);
    const newParentFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(newParentFolderId);

    return this.scenarioService.updateScenarioFolder(scenarioId, newParentFolder);
  }

  /////////////////////////////////////// NOTE //////////////////////////////////

  public async findNote(id: string): Promise<CnNote> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(id);
    return await this.noteService.findByIdAndCheck(id);
  }

  public async findNoteContent(id: string): Promise<TeRichText> {
    const noteFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(id);
    const parentFolder = await this.hierarchyObjectService.findByIdAndCheck(noteFolder.parentId);
    return await this.noteService.getNoteContent(parentFolder, id);
  }

  async createLabNote(
    createNoteDto: CnCreateNoteWithConfigDto,
    parentFolderId: string,
    files: BlFile[]
  ): Promise<void> {
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);

    // get and check all scenario
    const scenarios: CnScenario[] = [];
    for (const scenarioId of createNoteDto.scenario_ids) {
      const scenario = await this.scenarioService.findScenarioWithHierarchyById(scenarioId);

      if (scenario == null) {
        throw new BlBadRequestException(
          "Can't create the note because one of the linked scenario could not be found"
        );
      }

      if (scenario.hierarchyRepresentation.getRootFolderId() !== parentFolder.getRootFolderId()) {
        throw new BlBadRequestException(
          "Can't create the note because it is linked to an scenario of another root folder"
        );
      }
      scenarios.push(scenario);
    }

    const noteResult = await this.noteService.saveNote(createNoteDto, scenarios, parentFolder, files);

    if (noteResult.mode === 'create') {
      this.emitFolderEvent('CREATE_NOTE', parentFolder, noteResult.note);
    } else {
      this.emitFolderEvent('UPDATE_NOTE', parentFolder, noteResult.note);
    }
  }

  async deleteNoteFromLab(parentFolderId: string, noteId: string): Promise<void> {
    // check that the user can get the folder
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);

    let note: CnNote;
    await this.datasource.transaction(async (entityManager) => {
      note = await this.noteService.deleteNote(noteId, entityManager);
      await this.hierarchyObjectService.deleteById(noteId, entityManager);
    });

    if (note) {
      this.emitFolderEvent('DELETE_NOTE', parentFolder, note);
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    // for now, only admin can delete note directly
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new UnauthorizedException();
    }
    const noteFolder = await this.hierarchyObjectService.findByIdAndCheck(noteId, { parent: true });

    await this.deleteNoteFromLab(noteFolder.parentId, noteId);
  }

  async getNoteAssociatedToScenario(scenarioId: string): Promise<CnNote[]> {
    await this.findScenario(scenarioId);

    return (await this.scenarioService.findByIdAndCheckWithNotes(scenarioId)).notes;
  }

  async getNoteFile(noteId: string, filename: string): Promise<BlFileResponse> {
    const noteFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(noteId);
    const parentFolder = await this.hierarchyObjectService.findByIdAndCheck(noteFolder.parentId);
    return this.noteService.getFile(filename, parentFolder, noteId);
  }

  async getNoteView(noteId: string, viewId: string): Promise<BlFileResponse> {
    const noteFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(noteId);
    const parentFolder = await this.hierarchyObjectService.findByIdAndCheck(noteFolder.parentId);
    return this.noteService.getView(viewId, parentFolder, noteId);
  }

  public getNotesByRootFolderAndLab(rootFolderId: string, labId: string): Promise<CnNote[]> {
    return this.noteService.getNotesByRootFolderAndLab(rootFolderId, labId);
  }

  public async updateNoteFolder(noteId: string, newParentFolderId: string): Promise<CnNote> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(noteId);
    const newParentFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(newParentFolderId);

    return this.noteService.updateNoteFolder(noteId, newParentFolder);
  }

  /////////////////////////////////////// RESOURCE //////////////////////////////////

  public async shareResourceToFolder(
    parentFolderId: string,
    requestDTO: CnShareResourceRequestDTO
  ): Promise<void> {
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);

    await this.resourceService.saveResource(parentFolder, requestDTO);
  }

  public async deleteResource(resourceId: string): Promise<void> {
    // check that the user can get the folder
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(resourceId);

    await this.datasource.transaction(async (entityManager) => {
      await this.resourceService.deleteById(resourceId, entityManager);
      await this.hierarchyObjectService.deleteById(resourceId, entityManager);
    });
  }

  public async findResource(resourceId: string): Promise<CnResourceWithLab> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(resourceId);
    return await this.resourceService.findWithLabByIdAndCheck(resourceId);
  }

  public async renameResource(resourceId: string, name: string): Promise<CnResource> {
    const hierarchyObject = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(resourceId);
    const resource = await this.resourceService.renameResource(resourceId, name);

    this.emitFolderEvent(
      'RENAME_RESOURCE',
      await this.hierarchyObjectService.findByIdAndCheck(hierarchyObject.parentId),
      resource
    );

    return resource;
  }

  public async moveResource(resourceId: string, newFolderId: string): Promise<CnResource> {
    // check if user has authorization on object and new folder
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(resourceId);
    const newFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(newFolderId);
    await this.hierarchyObjectService.updateLeafParent(resourceId, newFolder);

    return this.resourceService.findByIdAndCheck(resourceId);
  }

  /////////////////////////////////////// GROUPS //////////////////////////////////

  public async shareFolder(rootFolderId: string, groupId: string): Promise<CnUser[]> {
    const folder = await this.getAndCheckAuthorizationForUpdate(rootFolderId);

    if (!folder.isRootFolder()) {
      throw new BlBadRequestException('Only root folders can be shared');
    }

    const newUsers = await this.folderUserService.shareRootFolderToGroup(folder.id, groupId);

    this.emitFolderEvent('SHARE_FOLDER', folder, newUsers);

    return this.folderUserService.findUsersByRootFolderId(rootFolderId);
  }

  public async unshareFolder(folderId: string, userId: string): Promise<void> {
    const folderHierarchy = await this.getAndCheckAuthorizationForUpdate(folderId);

    await this.unshareFolderNotSecure(folderHierarchy, userId);

    const user = await this.userService.findByIdAndCheck(userId);
    this.emitFolderEvent('UNSHARE_FOLDER', folderHierarchy, user);
  }

  private async unshareFolderNotSecure(folderHierarchy: CnHierarchyObject, userId: string): Promise<void> {
    const folder = await this.foldersService.findByIdAndCheck(folderHierarchy.id);
    // forbid to unshare the single user group of the leader
    // this is to unsure the leader will always have access to the folder
    if (userId === folder.leader.id) {
      throw new BlBadRequestException(CnErrorText.CANT_UNSHARED_FOLDER_LEADER_GROUP, {
        detailArgs: { folderName: folderHierarchy.name },
      });
    }

    await this.folderUserService.unshareRootFolderFromUser(folderHierarchy.id, userId);
  }

  public async unshareAllFolderForUser(userId: string, spaceId: string): Promise<void> {
    const rootFolders = await this.hierarchyObjectService.getAllRootFoldersOfUser(userId, spaceId);

    for (const rootFolder of rootFolders) {
      await this.unshareFolderNotSecure(rootFolder, userId);
    }
  }

  /**
   * Return the complete list of user that have access to the folder
   * @param folderId
   */
  public async getUsersOfFolder(folderId: string): Promise<CnUser[]> {
    const rootFolder = await this.checkFindOneAndGetRootFolder(folderId);

    return this.folderUserService.findUsersByRootFolderId(rootFolder.id);
  }

  public async searchFolderUsersByName(
    folderId: string,
    name: string,
    page: number,
    size: number
  ): Promise<ClPage<CnUser>> {
    const rootFolder = await this.checkFindOneAndGetRootFolder(folderId);

    const result = await this.folderUserService.smartSearchByName(rootFolder.id, name, page, size);
    const users = result.map((user) => user.user);

    if (ClHelpService.isNullOrEmpty(name)) {
      users.objects.unshift(getFakeUserEveryoneMention());
    }

    return users;
  }

  /////////////////////////////////////// FOLDER MESSAGE //////////////////////////////////

  async activateChat(folderId: string, enable: boolean): Promise<CnFolder> {
    await this.getAndCheckAuthorizationForUpdate(folderId);

    await this.datasource.transaction(async (entityManager) => {
      await this.foldersService.updatePartial(folderId, { chatEnabled: enable }, entityManager);
      await this.hierarchyObjectService.updatePartial(folderId, { chatEnabled: enable }, entityManager);
    });

    return this.foldersService.findByIdAndCheck(folderId);
  }

  async getChatFolders(): Promise<CnHierarchyObjectWithChildren[]> {
    const rootFoldersPage = await this.getCurrentRootFolders(0, 20);

    const rootFolders = rootFoldersPage.objects;

    const rootFoldersWithChildren: CnHierarchyObjectWithChildren[] = [];
    for (const rootFolder of rootFolders) {
      const rootFolderWithChild = await this.hierarchyObjectService.getFolderTreeForChat(rootFolder);
      if (rootFolderWithChild) {
        rootFoldersWithChildren.push(rootFolderWithChild);
      }
    }

    return rootFoldersWithChildren;
  }

  public async createChatMessage(newMessageDTO: CnNewMessageDTO, folderId: string): Promise<CnChatMessage> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    if (!folder.chatEnabled) {
      throw new BlBadRequestException('The chat is not enabled for this folder');
    }

    const message = await this.chatMessageService.createMessage(newMessageDTO, folder);

    this.emitFolderEvent('CREATE_FOLDER_MESSAGE', folder, message);
    return message;
  }

  public async updateChatMessage(
    folderId: string,
    messageId: string,
    messageDTO: CnNewMessageDTO
  ): Promise<CnChatMessage> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    const message = await this.chatMessageService.findByIdAndCheck(messageId);
    if (message.createdBy.id != CnCurrentUserHelper.getAndCheckCurrentUser().id) {
      throw new UnauthorizedException();
    }

    const newMessage = await this.chatMessageService.updateMessage(message, messageDTO.content);
    this.emitFolderEvent('UPDATE_FOLDER_MESSAGE', folder, message);
    return newMessage;
  }

  public async deleteChatMessage(folderId: string, messageId: string): Promise<void> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    const message = await this.chatMessageService.findByIdAndCheck(messageId);
    if (message.createdBy.id != CnCurrentUserHelper.getAndCheckCurrentUser().id) {
      throw new UnauthorizedException();
    }

    await this.chatMessageService.deleteMessage(message, folderId);
    this.emitFolderEvent('DELETE_FOLDER_MESSAGE', folder, message);
  }

  public async getFolderMessages(
    folderId: string,
    page: number,
    size: number
  ): Promise<ClPage<CnChatMessage>> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    if (!folder.chatEnabled) {
      throw new BlBadRequestException('The chat is not enabled for this folder');
    }

    return this.chatMessageService.getFolderMessages(folderId, page, size);
  }

  public async saveMessageImage(file: BlFile, folderId: string): Promise<TeBlockFigureUploadedResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);
    if (!folder.chatEnabled) {
      throw new BlBadRequestException('The chat is not enabled for this folder');
    }
    return this.chatMessageService.saveMessageImage(file, folder);
  }

  public async getMessageImage(filename: string, folderId: string): Promise<BlFileResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);
    if (!folder.chatEnabled) {
      throw new BlBadRequestException('The chat is not enabled for this folder');
    }
    return await this.chatMessageService.getMessageImage(folder, filename);
  }

  /////////////////////////////////////// DOCUMENT //////////////////////////////////

  public async uploadDocument(parentFolderId: string, file: BlFile): Promise<CnHierarchyObject> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);

    const doc = await this.documentService.uploadDocument(
      file,
      folder,
      CnDocumentType.UPLOADED_DOCUMENT,
      folder.id,
      file.originalname
    );

    this.emitFolderEvent('UPLOAD_FOLDER_DOCUMENT', folder, doc);

    return this.hierarchyObjectService.findByIdAndCheck(doc.id);
  }

  public async getUploadedDocument(documentId: string): Promise<BlFileResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);
    const document = await this.documentService.findByIdAndCheck(documentId);

    return await this.documentService.getDocumentContentByDocument(folder.getRootFolderId(), document);
  }

  public async deleteDocument(documentId: string): Promise<void> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);

    await this.datasource.transaction(async (entityManager) => {
      await this.documentService.deleteDocument(documentId, entityManager);
    });

    this.emitFolderEvent(
      'DELETE_FOLDER_DOCUMENT',
      await this.hierarchyObjectService.findByIdAndCheck(folder.parentId),
      document
    );
  }

  public async moveDocumentToTrash(documentId: string): Promise<CnDocument> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);

    const doc = await this.documentService.moveToTrash(document);

    this.emitFolderEvent(
      'MOVE_FOLDER_DOCUMENT_TO_TRASH',
      await this.hierarchyObjectService.findByIdAndCheck(folder.parentId),
      document
    );

    return doc;
  }

  public async restoreDocumentFromTrash(documentId: string): Promise<CnDocument> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);

    const doc = await this.documentService.restoreFromTrash(document);

    this.emitFolderEvent(
      'RESTORE_FOLDER_DOCUMENT_FROM_TRASH',
      await this.hierarchyObjectService.findByIdAndCheck(folder.parentId),
      document
    );

    return doc;
  }

  public async emptyTrash(folderId: string): Promise<void> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    await this.documentService.emptyFolderTrash(folder.id);
  }

  public async getDocumentsByFolder(
    parentFolderId: string,
    inTrash: boolean,
    page: number,
    size: number
  ): Promise<ClPage<CnDocument>> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);

    return this.documentService.getParentFolderDocuments(parentFolderId, inTrash, page, size);
  }

  public async renameDocument(documentId: string, newName: string): Promise<CnDocument> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId, {
      hierarchyRepresentation: true,
    });

    const doc = await this.documentService.renameDocument(folder.getRootFolderId(), document, newName);

    this.emitFolderEvent(
      'RENAME_DOCUMENT',
      await this.hierarchyObjectService.findByIdAndCheck(document.hierarchyRepresentation.parentId),
      document
    );

    return doc;
  }

  public async moveDocumentToFolder(documentId: string, parentFolderId: string): Promise<CnDocument> {
    const document = await this.documentService.findWithHierarchyByIdAndCheck(documentId);

    if (document.hierarchyRepresentation.parentId === parentFolderId) {
      throw new BlBadRequestException('The document is already in the destination folder');
    }

    // check if the user has the authorization to move the document on 2 folders
    const oldFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(
      document.hierarchyRepresentation.parentId
    );
    const newFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);

    return this.documentService.moveDocument(document, oldFolder, newFolder);
  }

  ////////////////////////////// UPLOAD FOLDER //////////////////////////////////
  /**
   * Upload a folder with files. The folder hierarchy is created, then the file uploaded.
   * @param parentFolderId
   * @param files
   */
  public async uploadFolder(parentFolderId: string, files: BlFile[]): Promise<void> {
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);

    if (files.length === 0) {
      throw new BlBadRequestException('The uploaded folder is empty');
    }

    if (files.length > 100) {
      throw new BlBadRequestException('The uploaded folder contains too many files. The limit is 100 files');
    }

    // check if the folder already exists
    const uploadedFolderName = files[0].originalname.split('/')[0];
    const subFolder = await this.hierarchyObjectService.findChildrenByNameAndType(
      parentFolderId,
      uploadedFolderName,
      CnHierarchyObjectType.FOLDER
    );
    if (subFolder.length > 0) {
      throw new BlBadRequestException(`The sub folder '${uploadedFolderName}' already exists`);
    }

    // upload the files and create the folder hierarchy
    for (const file of files) {
      const filePaths = file.originalname.split('/');

      const folders = filePaths.slice(0, filePaths.length - 1);
      const fileName = filePaths[filePaths.length - 1];

      // create or get the folder hierarchy
      let currentParent = parentFolder;
      for (const folderName of folders) {
        currentParent = await this.getOrCreateChildFolder(currentParent, folderName);
      }

      // folder hierarchy created, we can upload the file
      await this.documentService.uploadDocument(
        file,
        currentParent,
        CnDocumentType.UPLOADED_DOCUMENT,
        currentParent.id,
        fileName
      );
    }

    this.emitFolderEvent('UPLOAD_FOLDER', parentFolder, parentFolder);
  }

  private async getOrCreateChildFolder(
    parentFolder: CnHierarchyObject,
    folderName: string
  ): Promise<CnHierarchyObject> {
    const existingFolder = await this.hierarchyObjectService.findChildrenByNameAndType(
      parentFolder.id,
      folderName,
      CnHierarchyObjectType.FOLDER
    );
    if (existingFolder.length > 0) {
      return existingFolder[0];
    }
    // creating the folder
    const folderDTO = new CnSaveFolderDTO();
    folderDTO.name = folderName;
    const folder = await this.createSubFolderPrivate(folderDTO, parentFolder);
    return folder.hierarchyRepresentation;
  }

  ////////////////////////////// HISTORY ///////////////////////////////////////
  public async getNoteModifications(noteId: string): Promise<TeRichTextBlockModificationWithUser[]> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(noteId);

    await this.noteService.findByIdAndCheck(noteId);

    const richTextAggregate = await this.noteService.getNoteRichText(folder, noteId);
    return richTextAggregate.getModificationsDTO((userId) => this.userService.findUserBasicDTO(userId));
  }

  public async getConstellabDocumentModifications(
    documentId: string
  ): Promise<TeRichTextBlockModificationWithUser[]> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);

    const richTextAggregate = await this.documentService.getConstellabDocument(
      folder.getRootFolderId(),
      document
    );

    return richTextAggregate.getModificationsDTO((userId) => this.userService.findUserBasicDTO(userId));
  }

  public async getConstellabDocumentationUndoContent(
    documentId: string,
    modificationId: string
  ): Promise<TeRichText> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);
    const document = await this.documentService.findByIdAndCheck(documentId);
    const richText = await this.documentService.getConstellabDocumentPreviousVersion(
      folder.getRootFolderId(),
      document,
      modificationId
    );
    return richText.richText;
  }

  public async getNoteUndoContent(noteId: string, modificationId: string): Promise<TeRichText> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(noteId);
    await this.noteService.findByIdAndCheck(noteId);
    return await this.noteService.getNotePreviousVersion(folder, noteId, modificationId);
  }

  public async rollbackContent(documentId: string, modificationId: string): Promise<CnDocument> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);
    return await this.documentService.rollbackConstellabDocumentContent(
      folder.getRootFolderId(),
      document,
      modificationId
    );
  }

  //////////////////////////////////// CONSTELLAB DOCUMENTS ////////////////////////////////////////
  public async createConstellabDocument(
    parentFolderId: string,
    filename: string
  ): Promise<CnConstellabDocumentDTO> {
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(parentFolderId);

    const doc = await this.documentService.createConstellabDocument(parentFolder, filename);
    this.emitFolderEvent('CREATE_CONSTELLAB_DOCUMENT', parentFolder, doc.document);
    return doc;
  }

  public async updateConstellabDocument(
    documentId: string,
    richText: TeRichText
  ): Promise<CnConstellabDocumentDTO> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);

    // if the document was modified by another user 1 minute ago, we refuse the update
    // this is temporary until collaborative editing is implemented
    if (
      Math.abs(document.lastModifiedAt.diffNow().toMillis()) < 60000 &&
      document.lastModifiedBy.id !== CnCurrentUserHelper.getAndCheckCurrentUser().id
    ) {
      // eslint-disable-next-line max-len
      throw new BlBadRequestException(
        `This document is currently being modified by ${document.lastModifiedBy.alias}` +
          `, please wait for the end of the modification`
      );
    }

    const newDoc = await this.documentService.updateConstellabDocument(
      folder.getRootFolderId(),
      document,
      richText
    );

    this.emitFolderEvent(
      'UPDATE_CONSTELLAB_DOCUMENT',
      await this.hierarchyObjectService.findByIdAndCheck(folder.parentId),
      newDoc
    );
    return newDoc;
  }

  public async checkEditConstellabDocument(documentId: string): Promise<void> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);

    // if the document was modified by another user 1 minute ago, we refuse the update
    // this is temporary until collaborative editing is implemented
    if (
      Math.abs(document.lastModifiedAt.diffNow().toMillis()) < 60000 &&
      document.lastModifiedBy.id !== CnCurrentUserHelper.getAndCheckCurrentUser().id
    ) {
      // eslint-disable-next-line max-len
      throw new BlBadRequestException(
        `This document is currently being modified by ${document.lastModifiedBy.alias}` +
          `, please wait for the end of the modification`
      );
    }
  }

  public async getConstellabDocument(documentId: string): Promise<CnConstellabDocumentDTO> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);
    const richTextAggregate = await this.documentService.getConstellabDocument(
      folder.getRootFolderId(),
      document
    );
    return new CnConstellabDocumentDTO(document, richTextAggregate.getRichTextAsJson());
  }

  public async uploadImageToConstellabDocument(
    documentId: string,
    file: BlFile
  ): Promise<TeBlockFigureUploadedResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);
    const parentFolder = await this.hierarchyObjectService.findByIdAndCheck(folder.parentId);

    return this.documentService.uploadImageToConstellabDocument(parentFolder, document, file);
  }

  public async uploadFileToConstellabDocument(
    documentId: string,
    file: BlFile
  ): Promise<TeBlockFileUploadResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);
    const parentFolder = await this.hierarchyObjectService.findByIdAndCheck(folder.parentId);

    return this.documentService.uploadFileToConstellabDocument(parentFolder, document, file);
  }

  /**
   * Get the document (image or file) of a constellab document
   * @param documentId
   * @param documentName
   */
  public async getConstellabDocumentContentDocument(
    documentId: string,
    documentName: string
  ): Promise<BlFileResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    return this.documentService.getDocumentContentByTypeAndName(
      folder.getRootFolderId(),
      CnDocumentType.CONSTELLAB_DOCUMENT_CONTENT,
      documentName,
      documentId
    );
  }

  ////////////////////////////////////// DOCUMENT PREVIEW  /////////////////////////////////////////

  public async generatePreviewToken(documentId: string): Promise<CnDocumentPreviewDTO> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);

    return await this.documentService.generatePreviewToken(document);
  }

  /**
   * Public route to access document from the generated token
   * @param token
   */
  public async getDocumentByPreviewToken(token: string): Promise<BlFileResponse> {
    const document = await this.documentService.getAndCheckByPreviewToken(token);
    const folder = await this.hierarchyObjectService.findByIdAndCheck(document.id);

    return this.documentService.getDocumentContentByDocument(folder.getRootFolderId(), document);
  }

  /////////////////////////////////////// FOLDER BUCKET //////////////////////////////////

  public async createFolderBucket(
    rootFolderId: string,
    folderStorageLocationDTO: CnFolderStorageLocationDTO
  ): Promise<CnFolderStorageLocationDTO> {
    const folder = await this.getAndCheckAuthorizationForUpdate(rootFolderId);
    if (!folder.isRootFolder()) {
      throw new BlBadRequestException('The folder is not a root folder');
    }

    const folderWithStorage = await this.folderBucketService.findFolderWithStorageById(rootFolderId);

    if (folderWithStorage.mainStorage && folderWithStorage.backupStorage) {
      throw new BlBadRequestException('The folder storage regions are already defined');
    }

    if (folderWithStorage.mainStorage == null && folderStorageLocationDTO.mainStorage) {
      folderWithStorage.mainStorage = await this.folderBucketService.getBucketById(
        folderStorageLocationDTO.mainStorage.bucketId
      );
    }

    if (folderWithStorage.backupStorage == null && folderStorageLocationDTO.backupStorage) {
      folderWithStorage.backupStorage = await this.folderBucketService.getBucketById(
        folderStorageLocationDTO.backupStorage.bucketId
      );
    }

    await this.foldersService.update(folderWithStorage as CnFolderEntity);

    return {
      rootFolderId: rootFolderId,
      mainStorage: folderWithStorage.mainStorage?.getBucketLocation() ?? null,
      backupStorage: folderWithStorage.backupStorage?.getBucketLocation() ?? null,
    };
  }

  public async getFolderStorage(folderId: string): Promise<CnFolderStorageLocationDTO> {
    const folder = await this.getAndCheckAuthorizationForUpdate(folderId);
    const buckets = await this.folderBucketService.getRootFolderBucket(folder.getRootFolderId());

    // return only region to the user, he doesn't need the bucket name
    return {
      rootFolderId: folder.getRootFolderId(),
      mainStorage: buckets.mainStorage?.getBucketLocation() ?? null,
      backupStorage: buckets.backupStorage?.getBucketLocation() ?? null,
    };
  }

  public async findAccessibleFolderBucketLocation(
    page: number,
    size: number
  ): Promise<ClPage<CnBucketLocationDTO>> {
    const spaceId = CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    return this.folderBucketService.findAccessibleFolderBucketLocation(spaceId, page, size);
  }

  public async getStorageSizeByFolder(folderId: string): Promise<CnFolderStorageUsageDTO> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    const children = await this.getFolderDirectChildren(folderId);

    return this.documentService.getStorageSizeDetailByFolders([
      folderId,
      ...children.map((folder) => folder.id),
    ]);
  }

  /**
   * return true if the root folder id used the lab as storage (datahub)
   * @param rootFolderId
   * @param labId
   */
  public async folderUsesLabStorage(rootFolderId: string, labId: string): Promise<boolean> {
    return this.folderBucketService.folderUsesLabStorage(rootFolderId, labId);
  }

  /////////////////////////////////////// FOLDER USER //////////////////////////////////
  public async getCurrentUserRootFolderConfig(rootFolderId: string): Promise<CnFolderUser> {
    await this.getAndCheckAuthorizationForFindOneByHierarchyObject(rootFolderId);

    return this.folderUserService.findByRootFolderIdAndUserId(
      rootFolderId,
      CnCurrentUserHelper.getAndCheckCurrentUser().id
    );
  }

  public async updateRootFolderCurrentUserConfig(
    rootFolderId: string,
    options: CnFolderUser
  ): Promise<CnFolderUser> {
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(rootFolderId);

    if (!folder.isRootFolder()) {
      throw new BlBadRequestException('The folder is not a root folder');
    }

    options.rootFolderId = rootFolderId;
    options.userId = CnCurrentUserHelper.getAndCheckCurrentUser().id;

    return this.folderUserService.updateFolderUser(options);
  }

  /////////////////////////////////////// ACTIVITY //////////////////////////////////

  public async searchFolderActivity(
    folderId: string,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnActivity>> {
    // check that the user can view the folder
    const folder = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(folderId);

    const searchBuilder = new BlSearchBuilder<CnActivity>({ createdAt: 'DESC' as any });

    if (searchParam.hasFilter('includeSubFolders')) {
      const allFolders = await this.hierarchyObjectService.getFolderTreeAsList(folder);
      const allFolderIds = allFolders.map((folder) => folder.id);
      searchBuilder.mergeWhereOptions({
        parentEntityId: In(allFolderIds),
      });
      searchParam.removeFilter('includeSubFolders');
    } else {
      searchBuilder.mergeWhereOptions({
        parentEntityId: folderId,
      });
    }

    searchBuilder.addSearchParams(searchParam);

    // add filter on entity type if not already present
    if (!searchBuilder.hasWhereOptions('entityType')) {
      searchBuilder.mergeWhereOptions({
        entityType: In([
          CnActivityEntityType.FOLDER,
          CnActivityEntityType.MESSAGE,
          CnActivityEntityType.NOTE,
          CnActivityEntityType.SCENARIO,
          CnActivityEntityType.DOCUMENT,
        ]),
      });
    }

    return await this.activityService.search(searchBuilder.build(), page, size);
  }

  /////////////////////////////////////// TAG //////////////////////////////////
  public async createHierarchyObjectTag(
    hierarchyObjectId: string,
    tag: CnTag
  ): Promise<CnHierarchyObjectTag> {
    const hierarchyObject = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.createTag(tag, hierarchyObject);
  }

  public async createHierarchyObjectTags(
    hierarchyObjectId: string,
    tags: CnTag[]
  ): Promise<CnHierarchyObjectTag[]> {
    const hierarchyObject = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.createTags(tags, hierarchyObject);
  }

  public async createOrReplace(hierarchyObjectId: string, tags: CnTag[]): Promise<CnHierarchyObjectTag[]> {
    const hierarchyObject = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.createOrReplaceTagsByKey(tags, hierarchyObject);
  }

  public async deleteHierarchyObjectTag(hierarchyObjectId: string, tag: CnTag): Promise<void> {
    const hierarchyObject = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    await this.tagService.deleteTag(tag, hierarchyObject);
  }

  public async deleteHierarchyObjectTags(hierarchyObjectId: string, tags: CnTag[]): Promise<void> {
    const hierarchyObject = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    await this.tagService.deleteTags(tags, hierarchyObject);
  }

  public async getHierarchyObjectTagsPaginated(
    hierarchyObjectId: string,
    page: number,
    size: number
  ): Promise<ClPageI<CnTag>> {
    const hierarchyObject = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.findByHierarchyObjectPaginated(hierarchyObject, page, size);
  }

  public async getAllHierarchyObjectTags(hierarchyObjectId: string): Promise<CnTag[]> {
    const hierarchyObject = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.findAllByHierarchyObject(hierarchyObject);
  }

  public async getAvailableTagsInChildren(hierarchyObjectId: string): Promise<CnAvailableTags> {
    const hierarchyObject = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);
    return this.tagService.getAvailableTagsInChildren(hierarchyObject.id);
  }

  public async getAvailableTags(hierarchyObjectId: string): Promise<CnAvailableTags> {
    const hierarchyObject = await this.getAndCheckAuthorizationForFindOneByHierarchyObject(hierarchyObjectId);

    // get the available tag of parent, use current for root
    if (hierarchyObject.isRootFolder()) {
      return this.getAvailableTagForRootFolders();
    } else {
      return this.tagService.getAvailableTagsInChildren(hierarchyObject.parentId ?? hierarchyObject.id);
    }
  }

  public async getAvailableTagForRootFolders(): Promise<CnAvailableTags> {
    return this.tagService.getAvailableTagForRootFolders(
      CnCurrentUserHelper.getAndCheckCurrentSpace().id,
      CnCurrentUserHelper.getAndCheckCurrentUser().id
    );
  }

  /////////////////////////////////////// SECURITY //////////////////////////////////

  private async getAndCheckAuthorizationForFindOneByHierarchyObject(
    hierarchyObjectId: string
  ): Promise<CnHierarchyObject> {
    const folder = await this.hierarchyObjectService.findByIdAndCheck(hierarchyObjectId);

    await this.foldersAggregateSecurity.checkFindOne(folder);
    return folder;
  }

  private async getAndCheckAuthorizationForUpdate(folderId: string): Promise<CnHierarchyObject> {
    const folder = await this.hierarchyObjectService.findByIdAndCheck(folderId);

    await this.foldersAggregateSecurity.checkUpdate(folder);
    return folder;
  }

  private async checkFindOneAndGetRootFolder(folderId: string): Promise<CnHierarchyObject> {
    const folder = await this.hierarchyObjectService.findByIdAndCheck(folderId);

    return await this.foldersAggregateSecurity.checkFindOneAndGetRootFolder(folder);
  }

  //////////////////////////////// EVENT ///////////////////////////////////////
  private emitFolderEvent(eventType: CnFolderEventType, parentFolder: CnHierarchyObject, entity: any): void {
    const event: CnFolderEvent = {
      type: eventType,
      parentFolder: parentFolder,
      entity,
      user: CnCurrentUserHelper.getAndCheckCurrentUser(),
      space: CnCurrentUserHelper.getAndCheckCurrentSpace(),
    };
    this.eventEmitter.emit(cnFolderEventName, event);
  }
}
