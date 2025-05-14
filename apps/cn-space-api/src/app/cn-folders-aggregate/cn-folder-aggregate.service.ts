import { Injectable, Logger } from '@nestjs/common';
import { CnFoldersService } from './cn-folders/cn-folders.service';
import { CnFoldersSecurityService } from './cn-security/cn-folders-security.service';
import { CnFolder, CnFolderEntity, CnFolderWithHierarchy } from './cn-folders/cn-folder.entity';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { ClHelpService, ClPage, ClPageI } from '@monorepo/core-lib';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import {
  CnFolderStorageLocationDTO,
  CnGetFolderDescriptionDTO,
  CnSaveFolderDTO,
} from './cn-folders/cn-folder.dto';
import { CnUser } from '../cn-users/cn-user.entity';
import { getFakeUserEveryoneMention } from './cn-chat/cn-chat-message.entity';
import { CnChatMessageService } from './cn-chat/cn-chat-message.service';
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
import {
  CnFolderUser,
  CnFolderUserWithSharedBy,
  CnRootFolderUserRole,
} from './cn-folder-user/cn-folder-user.entity';
import { CnFolderEventService, cnRemoveFolderFromAllLabsEventName } from './cn-folder.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CnActivity, CnActivityEntityType } from '../cn-activity/cn-activity.entity';
import { CnActivityService } from '../cn-activity/cn-activity.service';
import { CnBucketLocationDTO } from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnDocumentService } from './cn-documents/cn-document.service';
import { CnDocumentType } from './cn-documents/cn-document.entity';
import { CnFolderStorageUsageDTO } from './cn-documents/cn-document-dto.class';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
  CnHierarchyObjectType,
  CnHierarchyObjectVisibility,
  CnHierarchyObjectWithChildren,
} from './cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from './cn-hierarchy-objects/cn-hierarchy-object.service';
import { TeBlockFigureUploadedResponse, TeRichText } from '@monorepo/te-text-editor';
import { CnHierarchyObjectTagAggregateService } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag-aggregate.service';
import { CnSpaceAggregateService } from '../cn-spaces/cn-space-aggregate.service';
import { CnFolderUserConfigDTO } from './cn-folder-user/cn-folder-user.dto';

@Injectable()
export class CnFolderAggregateService {
  protected readonly logger = new Logger(CnFolderAggregateService.name);

  constructor(
    private foldersService: CnFoldersService,
    private hierarchyObjectService: CnHierarchyObjectService,
    private securityService: CnFoldersSecurityService,
    private chatMessageService: CnChatMessageService,
    private datasource: DataSource,
    private folderBucketService: CnFolderBucketService,
    private documentService: CnDocumentService,
    private folderUserService: CnFolderUserService,
    private userService: CnUsersService,
    private eventEmitter: EventEmitter2,
    private activityService: CnActivityService,
    private tagService: CnHierarchyObjectTagAggregateService,
    private spaceAggregateService: CnSpaceAggregateService,
    private folderEventService: CnFolderEventService
  ) {}

  /////////////////////////////////////// FOLDER //////////////////////////////////

  async createRootFolder(folderDTO: CnSaveFolderDTO): Promise<CnFolderWithHierarchy> {
    const newFolder = await this.datasource.transaction(async (manager) => {
      const entity = this.createFolderFromDTO(folderDTO);

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

          // for now we prevent different bucket type because folder document stores
          // the bucket type and is used to differentiate lab bucket to other bucket
          if (entity.mainStorage.bucketType !== entity.backupStorage.bucketType) {
            throw new BlBadRequestException('Use the same cloud provider for main and backup storage');
          }
        }
      } else {
        // if the main storage is not set, we use the default storage of the space
        const space = await this.spaceAggregateService.getCurrentSpace();
        entity.mainStorage = space.defaultFolderBucket;
        entity.backupStorage = space.defaultFolderBackupBucket;
      }
      const dbFolder = await this.foldersService.create(entity, manager);

      // share the folder with the current user
      await this.folderUserService.shareRootFolderToUserIfNot(
        dbFolder.id,
        CnCurrentUserHelper.getAndCheckCurrentUser().id,
        CnRootFolderUserRole.OWNER,
        manager
      );

      if (folderDTO.tags?.length > 0) {
        await this.tagService.createTagsTransaction(
          folderDTO.tags,
          dbFolder.hierarchyRepresentation,
          manager
        );
      }

      return dbFolder;
    });

    this.folderEventService.emitFolderEvent('CREATE_ROOT_FOLDER', null, newFolder);
    return this.foldersService.findByIdAndCheckWithFolder(newFolder.id);
  }

  async createSubFolder(folderDto: CnSaveFolderDTO, parentFolderId: string): Promise<CnFolderWithHierarchy> {
    const parentFolder = await this.securityService.getAndCheckAuthorizationForUpdate(parentFolderId);
    const newFolder = await this.createSubFolderEntity(folderDto, parentFolder);

    this.folderEventService.emitFolderEvent('CREATE_SUB_FOLDER', parentFolder, newFolder);
    return this.foldersService.findByIdAndCheckWithFolder(newFolder.id);
  }

  /**
   * Create the sub folder but does not check the authorization or emit event
   * @param folderDTO
   * @param parentFolder
   * @private
   */
  public async createSubFolderEntity(
    folderDTO: CnSaveFolderDTO,
    parentFolder: CnHierarchyObject
  ): Promise<CnFolderWithHierarchy> {
    const entity = this.createFolderFromDTO(folderDTO);
    entity.style = CnFolderEntity.CHILD_FOLDER_STYLE;

    const parentFolderEntity = await this.foldersService.findByIdAndCheck(parentFolder.id);

    if (
      entity.endingDate &&
      parentFolderEntity.endingDate &&
      entity.endingDate > parentFolderEntity.endingDate
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
    const folder = await this.securityService.getAndCheckAuthorizationForUpdate(id);
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
    this.folderEventService.emitFolderEvent('UPDATE_FOLDER', null, newFolder);
    return this.foldersService.findByIdAndCheckWithFolder(newFolder.id);
  }

  async renameFolder(id: string, name: string): Promise<CnFolderWithHierarchy> {
    await this.securityService.getAndCheckAuthorizationForUpdate(id);
    const dbFolder = await this.foldersService.findByIdAndCheck(id);

    dbFolder.name = name;

    const newFolder = await this.foldersService.update(dbFolder as CnFolderEntity);
    this.folderEventService.emitFolderEvent('UPDATE_FOLDER', null, newFolder);
    return this.foldersService.findByIdAndCheckWithFolder(newFolder.id);
  }

  public async deleteFolder(hierarchyObject: CnHierarchyObject): Promise<boolean> {
    const children = await this.hierarchyObjectService.getDirectChildren(hierarchyObject.id);

    if (children.length > 0) {
      throw new BlBadRequestException(`The folder '${hierarchyObject.name}' is not empty, it can be deleted`);
    }

    // remove folder from all lab using event to avoid circular dependencies.
    // If the user can delete the folder, we consider he can remove it from labs
    if (hierarchyObject.isRootFolder()) {
      const results: string[] = await this.eventEmitter.emitAsync(
        cnRemoveFolderFromAllLabsEventName,
        hierarchyObject
      );
      // if a text is returned, it means an error occurred
      for (const res of results) {
        if (res) {
          throw new BlBadRequestException(res);
        }
      }
    }

    await this.datasource.transaction(async (entityManager) => {
      await this.chatMessageService.deleteByFolderId(hierarchyObject.id, entityManager);
      await this.foldersService.deleteById(hierarchyObject.id, entityManager);
      await this.hierarchyObjectService.deleteById(hierarchyObject.id, entityManager);
    });

    return true;
  }

  async findFolder(id: string): Promise<CnFolder> {
    await this.securityService.getAndCheckAuthorizationForFindOne(id);
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
      CnCurrentUserHelper.getAndCheckCurrentSpace().id,
      CnHierarchyObjectVisibility.VISIBLE
    );
  }

  public async getByCurrentSpace(page: number, size: number): Promise<ClPageI<CnHierarchyObject>> {
    const spaceId = CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    await this.securityService.checkFindAllBySpace();
    return this.hierarchyObjectService.getRootFoldersBySpace(spaceId, page, size);
  }

  public async getChildrenFolders(folderId: string): Promise<CnHierarchyObject[]> {
    await this.securityService.getAndCheckAuthorizationForFindOne(folderId);

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

  public async getFolderHierarchyObject(id: string): Promise<CnHierarchyObject> {
    return this.hierarchyObjectService.findByIdAndCheck(id);
  }

  public async moveFolder(
    folder: CnHierarchyObject,
    newParentFolder: CnHierarchyObject
  ): Promise<CnHierarchyObject> {
    // check that the user can modify the folder
    await this.securityService.getAndCheckAuthorizationForUpdate(folder.id);

    if (folder.isRootFolder()) {
      throw new BlBadRequestException('The root folder can not be moved');
    }
    if (folder.parentId === newParentFolder.id) {
      return folder;
    }

    const children = await this.hierarchyObjectService.findChildrenByNameAndType(
      newParentFolder.id,
      folder.name,
      CnHierarchyObjectType.FOLDER
    );
    if (children.length > 0) {
      throw new BlBadRequestException(
        `A folder with the name '${folder.name}' already exist in the destination folder` +
          ` '${newParentFolder.name}'`
      );
    }

    // check if the new parent is not a current child of the folder
    const ancestor = await this.hierarchyObjectService.getAncestors(newParentFolder);
    if (ancestor.find((descendant) => descendant.id === folder.id)) {
      throw new BlBadRequestException('The destination folder cannot be a child of the moved folder');
    }

    // check that the source root folder and the destination root folder are using the same bucket configs
    const folderToMoveBuckets = await this.folderBucketService.getAndCheckFolderBucketConfig(
      folder.getRootFolderId()
    );
    const newParentBuckets = await this.folderBucketService.getAndCheckFolderBucketConfig(
      newParentFolder.getRootFolderId()
    );

    if (!folderToMoveBuckets.equals(newParentBuckets)) {
      throw new BlBadRequestException(
        `The folder '${folder.name}' can not be moved to the folder ` +
          `'${newParentFolder.name}' because they use different storage location.` +
          ` Please move folder objects manually.`
      );
    }

    await this.datasource.transaction(async (entityManager) => {
      await this.hierarchyObjectService.updateFolderParent(folder, newParentFolder, entityManager);
    });

    return this.hierarchyObjectService.findByIdAndCheck(folder.id);
  }

  /////////////////////////////////////// FOLDER DESCRIPTION //////////////////////////////////

  public async getDescription(folderId: string): Promise<CnGetFolderDescriptionDTO> {
    await this.securityService.getAndCheckAuthorizationForFindOne(folderId);
    const description = await this.foldersService.getDescription(folderId);

    return {
      description: description.toJson(),
      canEdit: true,
    };
  }

  public async updateDescription(folderId: string, description: TeRichText): Promise<void> {
    const folder = await this.securityService.getAndCheckAuthorizationForUpdate(folderId);
    await this.foldersService.updateDescription(folderId, description);

    // update the folder object to set the hasDescription flag
    folder.hasDescription = !description.isEmpty();
    await this.hierarchyObjectService.update(folder as CnHierarchyObjectEntity);

    // for this event we send the description
    this.folderEventService.emitFolderEvent('UPDATE_FOLDER_DESCRIPTION', null, description);
  }

  public async saveDescriptionImage(folderId: string, file: BlFile): Promise<TeBlockFigureUploadedResponse> {
    const folder = await this.securityService.getAndCheckAuthorizationForUpdate(folderId);

    return this.documentService.uploadImageDocument(
      file,
      folder,
      CnDocumentType.DESCRIPTION_CONTENT,
      folder.id
    );
  }

  public async getDescriptionImage(folderId: string, filename: string): Promise<BlFileResponse> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);

    return this.documentService.getDocumentContentByTypeAndName(
      folder.getRootFolderId(),
      CnDocumentType.DESCRIPTION_CONTENT,
      filename,
      folderId
    );
  }

  /////////////////////////////////////// USERS //////////////////////////////////

  public async shareFolder(
    rootFolderId: string,
    groupId: string,
    role: CnRootFolderUserRole
  ): Promise<CnFolderUserWithSharedBy[]> {
    const folder = await this.securityService.getAndCheckAuthorizationForOwner(rootFolderId);

    if (!folder.isRootFolder()) {
      throw new BlBadRequestException('Only root folders can be shared');
    }

    const newUsers = await this.folderUserService.shareRootFolderToGroup(folder.id, groupId, role);

    this.folderEventService.emitFolderEvent('SHARE_FOLDER', folder, newUsers);

    return this.folderUserService.findByRootFolderIdWithSharedBy(rootFolderId);
  }

  public async updateFolderUserRole(
    rootFolderId: string,
    userId: string,
    role: CnRootFolderUserRole
  ): Promise<CnFolderUserWithSharedBy> {
    const folder = await this.securityService.getAndCheckAuthorizationForOwner(rootFolderId);

    if (!folder.isRootFolder()) {
      throw new BlBadRequestException('Only root folders can be shared');
    }

    const updatedUser = await this.folderUserService.updateRootFolderUserRole(folder.id, userId, role);
    this.folderEventService.emitFolderEvent('UPDATE_FOLDER_USER_ROLE', folder, updatedUser);

    return this.folderUserService.findByRootFolderIdAndUserIdAndCheckWithSharedBy(folder.id, userId);
  }

  public async unshareFolder(folderId: string, userId: string): Promise<void> {
    const folderHierarchy = await this.securityService.getAndCheckAuthorizationForOwner(folderId);

    await this.folderUserService.unshareRootFolderFromUser(folderHierarchy.id, userId);

    const user = await this.userService.findByIdAndCheck(userId);
    this.folderEventService.emitFolderEvent('UNSHARE_FOLDER', folderHierarchy, user);
  }

  public async unshareAllFolderForUser(userId: string, spaceId: string): Promise<void> {
    const rootFolders = await this.hierarchyObjectService.getAllRootFoldersOfUser(userId, spaceId);

    for (const rootFolder of rootFolders) {
      await this.folderUserService.unshareRootFolderFromUser(rootFolder.id, userId);
    }
  }

  /**
   * Return the complete list of user that have access to the folder
   * @param folderId
   */
  public async getUsersOfFolder(folderId: string): Promise<CnUser[]> {
    const hierarchyObject = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);
    const rootFolder = await this.hierarchyObjectService.getRootFolder(hierarchyObject);

    return this.folderUserService.findUsersByRootFolderId(rootFolder.id);
  }

  /**
   * Return the complete list of folder user with that have access to the folder
   * @param folderId
   */
  public async getFolderUsersWithRole(folderId: string): Promise<CnFolderUserWithSharedBy[]> {
    const rootFolder = await this.securityService.getAndCheckAuthorizationForOwner(folderId);

    return this.folderUserService.findByRootFolderIdWithSharedBy(rootFolder.id);
  }

  public async searchFolderUsersByName(
    folderId: string,
    name: string,
    page: number,
    size: number
  ): Promise<ClPage<CnUser>> {
    const hierarchyObject = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);
    const rootFolder = await this.hierarchyObjectService.getRootFolder(hierarchyObject);

    const result = await this.folderUserService.smartSearchByName(rootFolder.id, name, page, size);
    const users = result.map((user) => user.user);

    if (ClHelpService.isNullOrEmpty(name)) {
      users.objects.unshift(getFakeUserEveryoneMention());
    }

    return users;
  }

  public async getCurrentUserFolderInfo(rootFolderId: string): Promise<CnFolderUser> {
    return await this.folderUserService.findByRootFolderIdAndUserIdAndCheck(
      rootFolderId,
      CnCurrentUserHelper.getAndCheckCurrentUser().id
    );
  }

  public async updateRootFolderCurrentUserConfig(
    rootFolderId: string,
    userConfig: CnFolderUserConfigDTO
  ): Promise<CnFolderUser> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(rootFolderId);

    if (!folder.isRootFolder()) {
      throw new BlBadRequestException('The folder is not a root folder');
    }

    const userFolder = await this.folderUserService.findByRootFolderIdAndUserIdAndCheck(
      rootFolderId,
      CnCurrentUserHelper.getAndCheckCurrentUser().id
    );

    userFolder.folderNotif = userConfig.folderNotif;
    userFolder.messageNotif = userConfig.messageNotif;
    userFolder.scenarioNotif = userConfig.scenarioNotif;
    userFolder.noteNotif = userConfig.noteNotif;
    userFolder.documentNotif = userConfig.documentNotif;

    return this.folderUserService.updateFolderUser(userFolder);
  }

  /////////////////////////////////////// FOLDER BUCKET //////////////////////////////////

  public async createFolderBucket(
    rootFolderId: string,
    folderStorageLocationDTO: CnFolderStorageLocationDTO
  ): Promise<CnFolderStorageLocationDTO> {
    const folder = await this.securityService.getAndCheckAuthorizationForOwner(rootFolderId);
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
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);
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
    await this.securityService.getAndCheckAuthorizationForFindOne(folderId);

    const children = await this.hierarchyObjectService.getDirectChildren(folderId);

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

  /////////////////////////////////////// ACTIVITY //////////////////////////////////

  public async searchFolderActivity(
    folderId: string,
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnActivity>> {
    // check that the user can view the folder
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);

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
}
