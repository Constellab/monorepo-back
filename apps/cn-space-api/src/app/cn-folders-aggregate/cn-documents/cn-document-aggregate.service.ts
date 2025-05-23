import { BlBadRequestException, BlFile, BlFileResponse } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CnFrontService } from '../../cn-core/services/cn-front.service';
import { CnSpaceService } from '../../cn-spaces/cn-space.service';
import { CnFolderAggregateService } from '../cn-folder-aggregate.service';
import { CnFolderEventService } from '../cn-folder.event';
import { CnSaveFolderDTO } from '../cn-folders/cn-folder.dto';
import { CnHierarchyObject, CnHierarchyObjectType } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from '../cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnNotesService } from '../cn-notes/cn-notes.service';
import { CnFoldersSecurityService } from '../cn-security/cn-folders-security.service';
import { CnDocumentPreviewDTO } from './cn-document-dto.class';
import { CnDocument, CnDocumentType } from './cn-document.entity';
import { CnDocumentService } from './cn-document.service';

@Injectable()
export class CnDocumentAggregateService {
  constructor(
    private documentService: CnDocumentService,
    private hierarchyObjectService: CnHierarchyObjectService,
    private securityService: CnFoldersSecurityService,
    private folderAggregateService: CnFolderAggregateService,
    private eventService: CnFolderEventService,
    private datasource: DataSource,
    private spaceService: CnSpaceService,
    private frontService: CnFrontService,
    private noteService: CnNotesService
  ) {}

  public async uploadDocument(parentFolderId: string, file: BlFile): Promise<CnHierarchyObject> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(parentFolderId);

    const doc = await this.documentService.uploadDocument(
      file,
      folder,
      CnDocumentType.UPLOADED_DOCUMENT,
      folder.id,
      file.originalname
    );

    this.eventService.emitFolderEvent('UPLOAD_FOLDER_DOCUMENT', folder, doc);

    return this.hierarchyObjectService.findByIdAndCheck(doc.id);
  }

  public async getUploadedDocument(documentId: string): Promise<BlFileResponse> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(documentId);
    const document = await this.documentService.findByIdAndCheck(documentId);

    return await this.documentService.getDocumentContentByDocument(folder.getRootFolderId(), document);
  }

  public async deleteDocument(documentId: string): Promise<boolean> {
    await this.datasource.transaction(async (entityManager) => {
      await this.documentService.deleteDocument(documentId, entityManager);
    });
    return true;
  }

  public async renameDocument(documentId: string, newName: string): Promise<CnDocument> {
    const folder = await this.securityService.getAndCheckAuthorizationForUpdate(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId, {
      hierarchyRepresentation: true,
    });

    const doc = await this.documentService.renameDocument(folder.getRootFolderId(), document, newName);

    this.eventService.emitFolderEvent(
      'RENAME_DOCUMENT',
      await this.hierarchyObjectService.findByIdAndCheck(document.hierarchyRepresentation.parentId),
      document
    );

    return doc;
  }

  public async moveDocumentToFolder(
    document: CnHierarchyObject,
    parentFolder: CnHierarchyObject
  ): Promise<CnHierarchyObject> {
    const documentWithHierarchy = await this.documentService.findWithHierarchyByIdAndCheck(document.id);

    // check if the user has the authorization to move the document on 2 folders
    const oldFolder = await this.securityService.getAndCheckAuthorizationForFindOne(
      documentWithHierarchy.hierarchyRepresentation.parentId
    );

    return this.documentService.moveDocument(documentWithHierarchy, oldFolder, parentFolder);
  }

  public async findDocumentUrlByFilename(filename: string): Promise<string> {
    const document = await this.documentService.findDocumentByFilename(filename);
    const space = await this.spaceService.findByIdAndCheck(document.hierarchyRepresentation.spaceId);

    if (document.type === CnDocumentType.NOTE) {
      const note = await this.noteService.findByDocumentId(document.id);
      if (note == null) {
        throw new BlBadRequestException('Note not found');
      }
      return this.frontService.getNoteUrl(space.domain, note.id);
    }
    return this.frontService.getDocumentUrl(
      space.domain,
      document.id,
      document.type === CnDocumentType.CONSTELLAB_DOCUMENT
    );
  }

  ////////////////////////////// UPLOAD FOLDER //////////////////////////////////
  /**
   * Upload a folder with files. The folder hierarchy is created, then the file uploaded.
   * @param parentFolderId
   * @param files
   */
  public async uploadFolder(parentFolderId: string, files: BlFile[]): Promise<void> {
    const parentFolder = await this.securityService.getAndCheckAuthorizationForFindOne(parentFolderId);

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

    this.eventService.emitFolderEvent('UPLOAD_FOLDER', parentFolder, parentFolder);
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
    const folder = await this.folderAggregateService.createSubFolderEntity(folderDTO, parentFolder);
    return folder.hierarchyRepresentation;
  }

  ////////////////////////////////////// DOCUMENT PREVIEW  /////////////////////////////////////////

  public async generatePreviewToken(documentId: string): Promise<CnDocumentPreviewDTO> {
    await this.securityService.getAndCheckAuthorizationForFindOne(documentId);

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
}
