import { Injectable, Logger } from '@nestjs/common';
import { CnFolder, CnFolderWithHierarchy } from './cn-folders/cn-folder.entity';
import { CnFoldersService } from './cn-folders/cn-folders.service';
import { CnFolderAggregateService } from './cn-folder-aggregate.service';
import { CnDocumentService } from './cn-documents/cn-document.service';
import { CnSaveFolderDTO } from './cn-folders/cn-folder.dto';
import { BlBadRequestException } from '@monorepo/back-core-lib';
import { CnDocumentType } from './cn-documents/cn-document.entity';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { OnEvent } from '@nestjs/event-emitter';
import { CnUserEvent, cnUserEventName } from '../cn-users/cn-user.event';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnSpaceAggregateService } from '../cn-spaces/cn-space-aggregate.service';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { CnAuthContextUser } from '../cn-core/utils/cn-auth-context.class';

/**
 * Service to copy a folder and its content to another space folder
 * For now it copies, the folder, its children, the description and the documents
 */
@Injectable()
export class CnFolderCopierService {
  private readonly logger = new Logger(CnFolderCopierService.name);

  constructor(
    private aggregateService: CnFolderAggregateService,
    private folderService: CnFoldersService,
    private documentService: CnDocumentService,
    private coreConfigService: CnCoreConfigService,
    private spaceAggregateService: CnSpaceAggregateService
  ) {}

  /**
   * Listen to user events to create a default folder on user creation
   * @param userEvent
   */
  @OnEvent(cnUserEventName)
  public async onUserEvent(userEvent: CnUserEvent): Promise<void> {
    if (userEvent.type === 'CREATE_USER') {
      try {
        const folderToCopy = this.coreConfigService.getFolderIdToCopyOnSignup();
        if (!folderToCopy) return;
        const space = await this.spaceAggregateService.getUserPersonalSpaceAndCheck(userEvent.user.id);
        const spaceUser = await this.spaceAggregateService.getSpaceUserIfAccess(space.id, userEvent.user.id);

        if (!spaceUser) {
          // noinspection ExceptionCaughtLocallyJS
          throw new BlBadRequestException('User does not have access to the space');
        }

        // set the user and space in the context to create the default folder, documents...
        CnCurrentUserHelper.overrideAuth(
          new CnAuthContextUser(new CnUserSpaceInfo(userEvent.user, space, spaceUser.role))
        );
        await this.copyRootFolder(folderToCopy);
      } catch (error) {
        this.logger.error(`Error while creating default folder for user. ${error}`);
      } finally {
        CnCurrentUserHelper.clearAuthOverride();
      }
    }
  }

  /**
   * Copy a root folder to a destination space. The space default storage is used for the new folder
   * @param folderId
   */
  public async copyRootFolder(folderId: string): Promise<CnFolder> {
    const folder = await this.folderService.findByIdAndCheckWithFolder(folderId);

    if (!folder.hierarchyRepresentation.isRootFolder()) {
      throw new BlBadRequestException('The folder to copy must be a root folder');
    }

    const spaceSettings = await this.spaceAggregateService.getSpaceSettings(
      CnCurrentUserHelper.getAndCheckCurrentSpace().id
    );

    const saveFolderDTO = new CnSaveFolderDTO();
    saveFolderDTO.code = folder.code;
    saveFolderDTO.name = folder.name;
    saveFolderDTO.startingDate = folder.startingDate;
    saveFolderDTO.endingDate = folder.endingDate;
    saveFolderDTO.mainStorage = spaceSettings.defaultFolderStorageLocation;
    saveFolderDTO.backupStorage = spaceSettings.defaultFolderBackupStorageLocation;

    const newRootFolder = await this.aggregateService.createRootFolder(saveFolderDTO);

    await this.copyFolderContent(folder, newRootFolder);

    await this.copyFolderChildrenRecursively(folderId, newRootFolder.id);
    return newRootFolder;
  }

  private async copyFolderChildrenRecursively(parentId: string, targetFolderId: string): Promise<CnFolder[]> {
    const childrenFolders = await this.folderService.findChildrenFolders(parentId);

    const newChildrenFolders: CnFolder[] = [];
    for (const child of childrenFolders) {
      const saveFolderDTO = new CnSaveFolderDTO();
      saveFolderDTO.code = child.code;
      saveFolderDTO.name = child.name;
      saveFolderDTO.startingDate = child.startingDate;
      saveFolderDTO.endingDate = child.endingDate;
      const newFolder = await this.aggregateService.createSubFolder(saveFolderDTO, targetFolderId);
      newChildrenFolders.push(newFolder);

      await this.copyFolderContent(child, newFolder);
      await this.copyFolderChildrenRecursively(child.id, newFolder.id);
    }

    return newChildrenFolders;
  }

  public async copyFolderContent(sourceFolder: CnFolder, targetFolder: CnFolderWithHierarchy): Promise<void> {
    await this.copyFolderDescription(sourceFolder, targetFolder);

    // copy constellab and uploaded documents
    await this.copyFolderDocuments(sourceFolder, targetFolder, [
      CnDocumentType.CONSTELLAB_DOCUMENT,
      CnDocumentType.UPLOADED_DOCUMENT,
    ]);
  }

  private async copyFolderDescription(
    sourceFolder: CnFolder,
    targetFolder: CnFolderWithHierarchy
  ): Promise<void> {
    // copy the description of the child folder
    const childDescription = await this.folderService.getDescription(sourceFolder.id);
    if (!childDescription.isEmpty()) {
      await this.folderService.updateDescription(targetFolder.id, childDescription);
      // copy the documents attached to the description
      await this.copyFolderDocuments(sourceFolder, targetFolder, [CnDocumentType.DESCRIPTION_CONTENT]);
    }
  }

  private async copyFolderDocuments(
    sourceFolder: CnFolder,
    targetFolder: CnFolderWithHierarchy,
    documentTypes: CnDocumentType[]
  ): Promise<void> {
    const documents = await this.documentService.findVisibleChildrenDocumentByTypes(
      sourceFolder.id,
      documentTypes
    );
    for (const document of documents) {
      await this.documentService.copyDocument(document, targetFolder.hierarchyRepresentation);
    }
  }
}
