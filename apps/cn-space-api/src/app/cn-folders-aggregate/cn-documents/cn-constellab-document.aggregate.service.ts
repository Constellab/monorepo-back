import { BlBadRequestException, BlFile, BlFileResponse } from '@monorepo/back-core-lib';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeRichText,
  TeRichTextBlockModificationWithUser,
} from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';

import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnUsersService } from '../../cn-users/cn-users.service';
import { CnFolderEventService } from '../cn-folder.event';
import { CnHierarchyObjectService } from '../cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnFoldersSecurityService } from '../cn-security/cn-folders-security.service';
import { CnDocument, CnDocumentType } from './cn-document.entity';
import { CnDocumentService } from './cn-document.service';
import { CnConstellabDocumentDTO } from './cn-document-dto.class';

@Injectable()
export class CnConstellabDocumentAggregateService {
  constructor(
    private documentService: CnDocumentService,
    private hierarchyObjectService: CnHierarchyObjectService,
    private securityService: CnFoldersSecurityService,
    private folderEventService: CnFolderEventService,
    private usersService: CnUsersService
  ) {}

  public async createConstellabDocument(
    parentFolderId: string,
    filename: string
  ): Promise<CnConstellabDocumentDTO> {
    const parentFolder = await this.securityService.getAndCheckAuthorizationForUpdate(parentFolderId);

    const doc = await this.documentService.createConstellabDocument(parentFolder, filename);
    this.folderEventService.emitFolderEvent({
      type: 'CREATE_CONSTELLAB_DOCUMENT',
      entity: doc.document,
      parentFolder,
    });
    return doc;
  }

  public async updateConstellabDocument(
    documentId: string,
    richText: TeRichText
  ): Promise<CnConstellabDocumentDTO> {
    const folder = await this.securityService.getAndCheckAuthorizationForUpdate(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);

    // if the document was modified by another user 1 minute ago, we refuse the update
    // this is temporary until collaborative editing is implemented
    if (
      Math.abs(document.lastModifiedAt.diffNow().toMillis()) < 60000 &&
      document.lastModifiedBy.id !== CnCurrentUserHelper.getAndCheckCurrentUser().id
    ) {
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

    this.folderEventService.emitFolderEvent({
      type: 'UPDATE_CONSTELLAB_DOCUMENT',
      entity: newDoc.document,
      parentFolder: await this.hierarchyObjectService.findByIdAndCheck(folder.parentId),
    });
    return newDoc;
  }

  public async checkEditConstellabDocument(documentId: string): Promise<void> {
    await this.securityService.getAndCheckAuthorizationForUpdate(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);

    // if the document was modified by another user 1 minute ago, we refuse the update
    // this is temporary until collaborative editing is implemented
    if (
      Math.abs(document.lastModifiedAt.diffNow().toMillis()) < 60000 &&
      document.lastModifiedBy.id !== CnCurrentUserHelper.getAndCheckCurrentUser().id
    ) {
      throw new BlBadRequestException(
        `This document is currently being modified by ${document.lastModifiedBy.alias}` +
          `, please wait for the end of the modification`
      );
    }
  }

  public async getConstellabDocument(documentId: string): Promise<CnConstellabDocumentDTO> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(documentId);

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
    const folder = await this.securityService.getAndCheckAuthorizationForUpdate(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);
    const parentFolder = await this.hierarchyObjectService.findByIdAndCheck(folder.parentId);

    return this.documentService.uploadImageToConstellabDocument(parentFolder, document, file);
  }

  public async uploadFileToConstellabDocument(
    documentId: string,
    file: BlFile
  ): Promise<TeBlockFileUploadResponse> {
    const folder = await this.securityService.getAndCheckAuthorizationForUpdate(documentId);

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
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(documentId);

    return this.documentService.getDocumentContentByTypeAndName(
      folder.getRootFolderId(),
      CnDocumentType.CONSTELLAB_DOCUMENT_CONTENT,
      documentName,
      documentId
    );
  }

  ////////////////////////////// HISTORY ///////////////////////////////////////
  public async getConstellabDocumentModifications(
    documentId: string
  ): Promise<TeRichTextBlockModificationWithUser[]> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);

    const richTextAggregate = await this.documentService.getConstellabDocument(
      folder.getRootFolderId(),
      document
    );

    return richTextAggregate.getModificationsDTO((userId) => this.usersService.findUserBasicDTO(userId));
  }

  public async getConstellabDocumentationUndoContent(
    documentId: string,
    modificationId: string
  ): Promise<TeRichText> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(documentId);
    const document = await this.documentService.findByIdAndCheck(documentId);
    const richText = await this.documentService.getConstellabDocumentPreviousVersion(
      folder.getRootFolderId(),
      document,
      modificationId
    );
    return richText.richText;
  }

  public async rollbackContent(documentId: string, modificationId: string): Promise<CnDocument> {
    const folder = await this.securityService.getAndCheckAuthorizationForUpdate(documentId);

    const document = await this.documentService.findByIdAndCheck(documentId);
    return await this.documentService.rollbackConstellabDocumentContent(
      folder.getRootFolderId(),
      document,
      modificationId
    );
  }
}
