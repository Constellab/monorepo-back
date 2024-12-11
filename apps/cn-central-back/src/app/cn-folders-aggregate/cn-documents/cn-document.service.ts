import { Injectable, Logger } from '@nestjs/common';
import {
  BlAbstractService,
  BlBadRequestException,
  BlBucketType,
  BlFile,
  BlFileHelper,
  BlFileResponse,
  BlImageHelper,
  BlMultipleBucketConfig,
  BlObjectStorageService,
} from '@monorepo/back-core-lib';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeNewFullRichTextDTO,
  TeRichText,
  TeRichTextAggregate,
} from '@monorepo/te-text-editor';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { ClDateHelper, ClPage, ClStringHelper } from '@monorepo/core-lib';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnFolderBucketService } from '../cn-folders/cn-folder-bucket.service';
import { CnDocument, CnDocumentEntity, CnDocumentType, CnDocumentWithHierarchy } from './cn-document.entity';
import {
  CnConstellabDocumentDTO,
  CnDocumentPreviewDTO,
  CnDocumentStorageType,
  CnFolderStorageUsageDTO,
} from './cn-document-dto.class';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CnDocumentEvent, cnDocumentEventName, CnDocumentEventType } from './cn-document.event';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnHierarchyObject } from '../cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from '../cn_hierarchy_objects/cn-hierarchy-object.service';

interface CnDocumentS3Tags {
  name: string;
  folder: string;
}

@Injectable()
export class CnDocumentService extends BlAbstractService<CnDocumentEntity> {
  public static readonly OFFICE_PREVIEW_URL = 'https://view.officeapps.live.com/op/embed.aspx?src=';
  protected readonly logger = new Logger(CnDocumentService.name);

  constructor(
    @InjectRepository(CnDocumentEntity) private repository: Repository<CnDocumentEntity>,
    private objectStorageService: BlObjectStorageService,
    private folderBucketService: CnFolderBucketService,
    private eventEmitter: EventEmitter2,
    private configService: CnCoreConfigService,
    private hierarchyObjectService: CnHierarchyObjectService
  ) {
    super(repository, CnDocumentEntity);
  }

  //////////////////////////////////// GENERIC DOCUMENT //////////////////////////////////////////

  /**
   * Upload a document to a folder bucket
   * @param file
   * @param parentFolder
   * @param documentType
   * @param entityId
   * @param documentName if not provided, a name is generated with the extension
   * @param parentDocument
   */
  public async uploadDocument(
    file: BlFile,
    parentFolder: CnHierarchyObject,
    documentType: CnDocumentType,
    entityId: string,
    documentName?: string,
    parentDocument?: CnDocument
  ): Promise<CnDocument> {
    const bucketsConfig = await this.folderBucketService.getAndCheckFolderBucketConfig(
      parentFolder.getRootFolderId()
    );

    if (bucketsConfig.containsCloudBuckets()) {
      // check if the space storage is not full
      this.checkIfStorageIsFull(file.size);
    }

    if (documentName) {
      const existingDocument = await this.findDocumentByTypeAndNameAndEntity(
        documentType,
        documentName,
        entityId
      );
      if (existingDocument) {
        throw new BlBadRequestException(CnErrorText.DOCUMENT_ALREADY_EXIST);
      }
    } else {
      documentName = this.objectStorageService.generateRandomFileNameFromExtension(
        BlFileHelper.getFileExtension(file.originalname)
      );
    }

    let document = CnDocumentEntity.newDocument(
      documentName,
      this.objectStorageService.generateRandomFileNameFromExtension(
        BlFileHelper.getFileExtension(file.originalname)
      ),
      file.size,
      file.mimetype,
      documentType,
      entityId,
      // TODO TO IMPROVE
      bucketsConfig.bucketConfigs[0].type,
      parentFolder,
      parentDocument
    );

    await this.objectStorageService.uploadObject(bucketsConfig.bucketConfigs, file, {
      filename: document.filename,
      tags: this.getTags(document.name, parentFolder.id),
    } as any);

    try {
      document = await this.save(document);
    } catch (error) {
      this.logger.error('Error while saving document', error);
      await this.objectStorageService.deleteObjectIfExist(bucketsConfig.bucketConfigs, document.filename);
      throw error;
    }

    this.emitEvent('CREATE_DOCUMENT', document);
    return document;
  }

  public async uploadImageDocument(
    file: BlFile,
    parentFolder: CnHierarchyObject,
    documentType: CnDocumentType,
    entityId: string,
    documentName?: string,
    parentDocument?: CnDocument
  ): Promise<TeBlockFigureUploadedResponse> {
    const imSize = BlImageHelper.getImageSize(file);
    if (!documentName) {
      documentName = this.objectStorageService.generateRandomFileNameFromExtension(imSize.type);
    }
    const imageDoc = await this.uploadDocument(
      file,
      parentFolder,
      documentType,
      entityId,
      documentName,
      parentDocument
    );

    return {
      filename: imageDoc.name,
      height: imSize.height,
      width: imSize.width,
    };
  }

  async getDocumentContentByTypeAndName(
    rootFolderId: string,
    documentType: CnDocumentType,
    documentName: string,
    entityId: string
  ): Promise<BlFileResponse> {
    const document = await this.findDocumentByTypeAndNameAndEntity(documentType, documentName, entityId);

    if (document == null) {
      throw new BlBadRequestException('Document not found');
    }

    return this.getDocumentContentByDocument(rootFolderId, document);
  }

  public async getDocumentContentByDocument(
    rootFolderId: string,
    document: CnDocument
  ): Promise<BlFileResponse> {
    const bucketConfig = await this.folderBucketService.getAndCheckFolderMainBucketConfig(rootFolderId);
    return this.objectStorageService.downloadObject(bucketConfig, document.filename);
  }

  public async deleteDocument(id: string, entityManager?: EntityManager): Promise<void> {
    entityManager = this.getEntityManager(entityManager);
    const document = await this.findByIdAndCheck(
      id,
      { hierarchyRepresentation: { parent: true } },
      entityManager
    );

    const bucketConfig = await this.folderBucketService.getAndCheckFolderBucketConfig(
      document.hierarchyRepresentation.getRootFolderId()
    );
    if (document.documentTypeSupportsTrash() && !document.inTrash) {
      throw new BlBadRequestException('Document is not in trash, please move it to trash first');
    }

    const documentsToDelete: CnDocumentWithHierarchy[] = [document];
    // delete the children document as well
    const children = await this.findChildrenDocuments(document.id);
    documentsToDelete.unshift(...children);

    for (const doc of documentsToDelete) {
      await entityManager.remove(doc);
      await entityManager.remove(doc.hierarchyRepresentation);
    }

    // delete all object in the store
    const documentFilenames = documentsToDelete.map((d) => d.filename);
    await this.objectStorageService.deleteMultipleObjects(bucketConfig.bucketConfigs, documentFilenames);

    this.emitEvent('DELETE_DOCUMENT', document);
  }

  public async emptyFolderTrash(parentFolderId: string): Promise<void> {
    const documentToDelete = await this.repo.find({
      where: {
        hierarchyRepresentation: { parentId: parentFolderId },
        inTrash: true,
      },
    });

    for (const doc of documentToDelete) {
      await this.deleteDocument(doc.id);
    }
  }

  async renameDocument(rootFolderId: string, document: CnDocument, newName: string): Promise<CnDocument> {
    const bucketConfig = await this.folderBucketService.getAndCheckFolderBucketConfig(rootFolderId);
    const tags: Partial<CnDocumentS3Tags> = { name: newName };
    await this.objectStorageService.setObjectTags(bucketConfig.bucketConfigs, document.filename, tags);

    document.name = newName;
    return await this.save(document as CnDocumentEntity);
  }

  /**
   * Find the document based on its type, parentFolder and name.
   * Using the entityId make sure that the requested document is associated to the entity and so
   * this prevents access to a document of another entity
   * @param type
   * @param name
   * @param entityId
   */
  async findDocumentByTypeAndNameAndEntity(
    type: CnDocumentType,
    name: string,
    entityId: string
  ): Promise<CnDocument | null> {
    return this.repo.findOne({
      where: {
        type: type,
        name: name,
        entityId: entityId,
      },
    });
  }

  ////////////////////////////// FOLDER DOCUMENTS  //////////////////////////////////

  public findRootDocumentsByParentFolder(parentFolderId: string): Promise<CnDocument[]> {
    return this.repo.find({
      where: {
        hierarchyRepresentation: { parentId: parentFolderId },
        parentDocument: IsNull(),
      },
    });
  }

  public findWithHierarchyByIdAndCheck(documentId: string): Promise<CnDocumentWithHierarchy> {
    return this.findByIdAndCheck(documentId, { hierarchyRepresentation: true });
  }

  /**
   * List the Uploaded and Constellab documents of a parentFolder
   */
  public getParentFolderDocuments(
    parentFolderId: string,
    inTrash: boolean,
    page: number,
    size: number
  ): Promise<ClPage<CnDocument>> {
    return this.findPaginated(page, size, {
      where: {
        hierarchyRepresentation: { parentId: parentFolderId },
        inTrash: inTrash,
        type: In([CnDocumentType.UPLOADED_DOCUMENT, CnDocumentType.CONSTELLAB_DOCUMENT]),
      },
      order: {
        createdAt: 'DESC' as any,
      },
    });
  }

  ///////////////////////////////// JSON  DOCUMENTS //////////////////////////////////
  public async createJSONDocument(
    parentFolder: CnHierarchyObject,
    type: CnDocumentType,
    documentName: string,
    entityId: string,
    content: any,
    parentDocument?: CnDocument
  ): Promise<CnDocument> {
    const bucketsConfig = await this.folderBucketService.getAndCheckFolderBucketConfig(
      parentFolder.getRootFolderId()
    );

    if (bucketsConfig.containsCloudBuckets()) {
      // check if the space storage is not full, consider size of this document as 0
      this.checkIfStorageIsFull(0);
    }

    let document = CnDocumentEntity.newDocument(
      documentName,
      this.objectStorageService.generateRandomFileNameFromExtension('json'),
      0,
      'application/json',
      type,
      entityId,
      bucketsConfig.bucketConfigs[0].type,
      parentFolder,
      parentDocument
    );

    await this.objectStorageService.uploadJson(bucketsConfig.bucketConfigs, content, {
      filename: document.filename,
      tags: this.getTags(document.name, parentFolder.id),
    } as any);

    try {
      const objectInfo = await this.objectStorageService.getObjectInfo(
        bucketsConfig.getFirstBucket(),
        document.filename
      );
      document.size = objectInfo.size;

      document = await this.save(document);
    } catch (error) {
      this.logger.error('Error while saving json document', error);
      await this.objectStorageService.deleteObjectIfExist(bucketsConfig.bucketConfigs, document.filename);
      throw error;
    }

    this.emitEvent('CREATE_DOCUMENT', document);
    return document;
  }

  public async updateJSONDocument(
    rootFolderId: string,
    document: CnDocument,
    content: any
  ): Promise<CnDocument> {
    const bucketsConfig = await this.folderBucketService.getAndCheckFolderBucketConfig(rootFolderId);

    if (bucketsConfig.containsCloudBuckets()) {
      // check if the space storage is not full, consider si of this document as 0
      this.checkIfStorageIsFull(0);
    }

    await this.objectStorageService.uploadJson(bucketsConfig.bucketConfigs, content, {
      filename: document.filename,
    });

    const objectInfo = await this.objectStorageService.getObjectInfo(
      bucketsConfig.getFirstBucket(),
      document.filename
    );

    // update the document size and last modification info
    document.size = objectInfo.size;
    document = await this.repository.save(document);

    this.emitEvent('UPDATE_DOCUMENT', document);
    return document;
  }

  public async createOrUpdateJSONDocument(
    parentFolder: CnHierarchyObject,
    type: CnDocumentType,
    documentName: string,
    entityId: string,
    content: any,
    parentDocument?: CnDocument
  ): Promise<CnDocument> {
    const document = await this.findDocumentByTypeAndNameAndEntity(type, documentName, entityId);

    if (document) {
      return this.updateJSONDocument(parentFolder.getRootFolderId(), document, content);
    } else {
      return this.createJSONDocument(parentFolder, type, documentName, entityId, content, parentDocument);
    }
  }

  public async getJSONDocumentContent(rootFolderId: string, document: CnDocument): Promise<any> {
    const bucketConfig = await this.folderBucketService.getAndCheckFolderMainBucketConfig(rootFolderId);
    return await this.objectStorageService.getObjectAsJson(bucketConfig, document.filename);
  }

  //////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////

  public async createConstellabDocument(
    parentFolder: CnHierarchyObject,
    documentName: string
  ): Promise<CnConstellabDocumentDTO> {
    const richText = new TeRichTextAggregate();
    const docContent: TeNewFullRichTextDTO = richText.toJson();
    const doc = await this.createJSONDocument(
      parentFolder,
      CnDocumentType.CONSTELLAB_DOCUMENT,
      documentName,
      parentFolder.id,
      docContent
    );
    return new CnConstellabDocumentDTO(doc, richText.getRichTextAsJson());
  }

  async updateConstellabDocument(
    rootFolderId: string,
    document: CnDocument,
    newRichText: TeRichText
  ): Promise<CnConstellabDocumentDTO> {
    const richTextAggregate = await this.getConstellabDocument(rootFolderId, document);
    richTextAggregate.updateContent(newRichText, CnCurrentUserHelper.getAndCheckCurrentUser().id);

    return new CnConstellabDocumentDTO(
      await this.updateJSONDocument(rootFolderId, document, richTextAggregate.toJson()),
      richTextAggregate.getRichTextAsJson()
    );
  }

  async getConstellabDocument(rootFolderId: string, document: CnDocument): Promise<TeRichTextAggregate> {
    if (document.type !== CnDocumentType.CONSTELLAB_DOCUMENT) {
      throw new BlBadRequestException('The document is not a constellab document');
    }

    const json = await this.getJSONDocumentContent(rootFolderId, document);
    return TeRichTextAggregate.fromJson(json);
  }

  async uploadImageToConstellabDocument(
    parentFolder: CnHierarchyObject,
    document: CnDocument,
    file: BlFile
  ): Promise<TeBlockFigureUploadedResponse> {
    return this.uploadImageDocument(
      file,
      parentFolder,
      CnDocumentType.CONSTELLAB_DOCUMENT_CONTENT,
      document.id,
      null,
      document
    );
  }

  async uploadFileToConstellabDocument(
    parentFolder: CnHierarchyObject,
    document: CnDocument,
    file: BlFile
  ): Promise<TeBlockFileUploadResponse> {
    const fileName = await this.checkNewDocumentName(
      CnDocumentType.CONSTELLAB_DOCUMENT_CONTENT,
      file.originalname,
      document.id
    );

    const newDocument = await this.uploadDocument(
      file,
      parentFolder,
      CnDocumentType.CONSTELLAB_DOCUMENT_CONTENT,
      document.id,
      fileName,
      document
    );

    return {
      name: newDocument.name,
      size: newDocument.size,
    };
  }

  ////////////////////////////////////////////// TRASH ///////////////////////////////////////////////
  public async moveToTrash(document: CnDocument): Promise<CnDocument> {
    document.inTrash = true;
    return await this.repo.save(document);
  }

  public async restoreFromTrash(document: CnDocument): Promise<CnDocument> {
    document.inTrash = false;
    return await this.repo.save(document);
  }

  ////////////////////////////////////////////// SIZE /////////////////////////////////////////////

  public async getStorageSizeDetailByFolders(folderIds: string[]): Promise<CnFolderStorageUsageDTO> {
    const documents = await this.repository.findBy({ hierarchyRepresentation: { parentId: In(folderIds) } });
    return this.documentsToAggregateDTO(documents);
  }

  public async getStorageSizeDetailBySpace(spaceId: string): Promise<CnFolderStorageUsageDTO> {
    const documents = await this.repository.findBy({ hierarchyRepresentation: { spaceId: spaceId } });
    return this.documentsToAggregateDTO(documents);
  }

  public async getSpaceCloudStorageSize(spaceId: string): Promise<number> {
    // calculate with sql sum query, join parentFolder table with document.folderId = folder.id
    const result = await this.repository.manager.query(
      `
        SELECT SUM(size) as totalSize
        FROM document
               JOIN hierarchy_object ON document.id = hierarchy_object.id
        WHERE hierarchy_object.spaceId = ?
          and document.bucketType != ?
      `,
      [spaceId, BlBucketType.LAB]
    );
    return result[0].totalSize ?? 0;
  }

  public checkIfStorageIsFull(documentSize: number): void {
    const space = CnCurrentUserHelper.getAndCheckCurrentSpace();
    if (!space.hasEnoughStorageForNewFile(documentSize)) {
      if (documentSize === 0) {
        throw new BlBadRequestException(
          'Space storage is full, please contact your ' +
            'space administrator to increase the storage limit, delete some documents or empty the trash.'
        );
      } else {
        throw new BlBadRequestException(
          'There is not enough remaining free storage in ' +
            'your space to upload this document. ' +
            'Please contact your space administrator to increase the storage limit, ' +
            'delete some documents or empty the trash.'
        );
      }
    }
  }

  ////////////////////////////////////////////// PREVIEW  /////////////////////////////////////////////

  public async generatePreviewToken(document: CnDocument): Promise<CnDocumentPreviewDTO> {
    if (!document.canTokenPreview) {
      throw new BlBadRequestException('This document cannot be previewed');
    }
    // don't generate the token if the last token is still valid with 10 minutes margin
    if (document.previewTokenExpiration < ClDateHelper.getDate().plus({ minutes: 10 })) {
      document.previewToken = ClStringHelper.generateUUID();
      // set expiration in 1 hour
      document.previewTokenExpiration = ClDateHelper.getDate().plus({ hours: 1 });
      document = await this.repo.save(document, { listeners: false });
    }

    // Generate the preview URL that use office online viewer with public api route
    const constellabPreviewUrl =
      `${this.configService.getApiUrl()}/folders/document/preview/` + `${document.previewToken}`;
    return new CnDocumentPreviewDTO(`${CnDocumentService.OFFICE_PREVIEW_URL}${constellabPreviewUrl}`);
  }

  public async getAndCheckByPreviewToken(token: string): Promise<CnDocument> {
    const document = await this.repo.findOne({ where: { previewToken: token } });
    if (!document) {
      throw new BlBadRequestException('Document not found');
    }

    if (document.previewTokenExpiration < ClDateHelper.getDate()) {
      throw new BlBadRequestException('Preview token has expired');
    }

    return document;
  }

  /////////////////////////////////////////////// HISTORY /////////////////////////////////////////////
  public async getConstellabDocumentPreviousVersion(
    rootFolderId: string,
    document: CnDocument,
    modificationId: string
  ): Promise<TeRichTextAggregate> {
    const richTextAggregate = await this.getConstellabDocument(rootFolderId, document);

    richTextAggregate.undoModifications(modificationId);
    return richTextAggregate;
  }

  public async rollbackConstellabDocumentContent(
    rootFolderId: string,
    document: CnDocument,
    modificationId: string
  ): Promise<CnDocument> {
    const richText = await this.getConstellabDocumentPreviousVersion(rootFolderId, document, modificationId);
    const newDocContent: TeNewFullRichTextDTO = richText.toJson();

    return await this.updateJSONDocument(rootFolderId, document, newDocContent);
  }

  ////////////////////////////////////////////// OTHERS /////////////////////////////////////////////

  public async moveDocument(
    document: CnDocumentWithHierarchy,
    oldParentFolder: CnHierarchyObject,
    newParentFolder: CnHierarchyObject
  ): Promise<CnDocumentWithHierarchy> {
    const oldBuckets = await this.folderBucketService.getAndCheckFolderBucketConfig(
      oldParentFolder.getRootFolderId()
    );
    const newBuckets = await this.folderBucketService.getAndCheckFolderBucketConfig(
      newParentFolder.getRootFolderId()
    );

    // move the children document as well
    const children = await this.findChildrenDocuments(document.id);
    const newDocument = await this.moveDocumentFromBucket(document, newParentFolder, oldBuckets, newBuckets);

    // also move the children
    for (const doc of children) {
      await this.moveDocumentFromBucket(doc, newParentFolder, oldBuckets, newBuckets);
    }

    return newDocument;
  }

  private findChildrenDocuments(parentDocumentId: string): Promise<CnDocumentWithHierarchy[]> {
    return this.repo.find({
      where: { parentDocument: { id: parentDocumentId } },
      relations: { hierarchyRepresentation: true },
    });
  }

  ////////////////////////////////////////////// OTHERS /////////////////////////////////////////////

  private documentsToAggregateDTO(documents: CnDocument[]): CnFolderStorageUsageDTO {
    const aggregationDTO: CnFolderStorageUsageDTO = new CnFolderStorageUsageDTO();

    const mappings: Record<CnDocumentType, CnDocumentStorageType> = {
      [CnDocumentType.UPLOADED_DOCUMENT]: CnDocumentStorageType.UPLOADED_DOCUMENT,
      [CnDocumentType.DESCRIPTION_CONTENT]: CnDocumentStorageType.DESCRIPTION,
      [CnDocumentType.CONSTELLAB_DOCUMENT]: CnDocumentStorageType.NOTE,
      [CnDocumentType.NOTE]: CnDocumentStorageType.NOTE,
      [CnDocumentType.NOTE_CONTENT]: CnDocumentStorageType.NOTE,
      [CnDocumentType.CONSTELLAB_DOCUMENT_CONTENT]: CnDocumentStorageType.NOTE,
      [CnDocumentType.MESSAGE_CONTENT]: CnDocumentStorageType.MESSAGE,
    };

    for (const doc of documents) {
      const type = mappings[doc.type];
      aggregationDTO.addDocumentSize(type, doc.size, doc.bucketType);
    }

    return aggregationDTO;
  }

  private async moveDocumentFromBucket(
    document: CnDocumentWithHierarchy,
    newParentFolder: CnHierarchyObject,
    oldBuckets: BlMultipleBucketConfig,
    newBuckets: BlMultipleBucketConfig
  ): Promise<CnDocumentWithHierarchy> {
    const tags = this.getTags(document.name, newParentFolder.id);
    // move the object in the storage is needed
    if (oldBuckets.equals(newBuckets)) {
      // update the folder tag
      await this.objectStorageService.setObjectTags(newBuckets.bucketConfigs, document.filename, tags as any);
    } else {
      await this.objectStorageService.moveObjectToAnotherBucket(
        oldBuckets.bucketConfigs,
        newBuckets.bucketConfigs,
        document.filename,
        document.filename
      );
    }

    // TODO there is no rollback if the there is an error
    await this.hierarchyObjectService.updateParent(document.hierarchyRepresentation.id, newParentFolder);
    return document;
  }

  public async copyDocument(
    sourceDocument: CnDocumentWithHierarchy,
    targetParentFolder: CnHierarchyObject,
    parentDocument?: CnDocument
  ): Promise<CnDocument> {
    if (sourceDocument.type === CnDocumentType.NOTE || sourceDocument.type === CnDocumentType.NOTE_CONTENT) {
      throw new BlBadRequestException('Cannot copy a note');
    }
    const content = await this.getDocumentContentByDocument(
      sourceDocument.hierarchyRepresentation.getRootFolderId(),
      sourceDocument
    );

    const file: BlFile = {
      originalname: sourceDocument.getNameWithExtension(),
      buffer: await BlFileHelper.convertFileStreamToBuffer(content.file),
      size: sourceDocument.size,
      mimetype: sourceDocument.mimeType,
    };

    // retrieve the correct entityId based on the source document type
    let entityId: string;
    if ([CnDocumentType.CONSTELLAB_DOCUMENT_CONTENT].includes(sourceDocument.type)) {
      if (!parentDocument) {
        throw new BlBadRequestException(
          'Cannot copy a constellab content document without a parent document'
        );
      }
      entityId = parentDocument.id;
    } else if (
      [
        CnDocumentType.UPLOADED_DOCUMENT,
        CnDocumentType.CONSTELLAB_DOCUMENT,
        CnDocumentType.DESCRIPTION_CONTENT,
        CnDocumentType.MESSAGE_CONTENT,
      ].includes(sourceDocument.type)
    ) {
      entityId = targetParentFolder.id;
    } else {
      throw new BlBadRequestException('Cannot copy a document with this type');
    }
    const document = await this.uploadDocument(
      file,
      targetParentFolder,
      sourceDocument.type,
      entityId,
      sourceDocument.name,
      parentDocument
    );

    // copy the children document as well
    const children = await this.findChildrenDocuments(sourceDocument.id);
    for (const doc of children) {
      await this.copyDocument(doc, targetParentFolder, document);
    }

    return document;
  }

  private emitEvent(eventType: CnDocumentEventType, document: CnDocument): void {
    const event: CnDocumentEvent = {
      type: eventType,
      entity: document,
      spaceId: CnCurrentUserHelper.getCurrentSpace().id,
    };
    this.eventEmitter.emit(cnDocumentEventName, event);
  }

  /**
   * Method to check if a document with same name exists and if so, add an index to the name
   * @private
   */
  private async checkNewDocumentName(
    documentType: CnDocumentType,
    documentName: string,
    entityId: string
  ): Promise<string> {
    let i = 0;
    while (i < 10) {
      const name = i === 0 ? documentName : BlFileHelper.addIndexToFileName(documentName, i);

      const existingDocument = await this.findDocumentByTypeAndNameAndEntity(documentType, name, entityId);
      if (!existingDocument) {
        return name;
      }
      i++;
    }

    throw new BlBadRequestException('Document with this name already exists');
  }

  private getTags(documentName: string, folderId: string): CnDocumentS3Tags {
    return {
      name: documentName,
      folder: folderId,
    };
  }

  public findVisibleChildrenDocumentByTypes(
    folderId: string,
    types: CnDocumentType[]
  ): Promise<CnDocumentWithHierarchy[]> {
    return this.repo.find({
      where: {
        hierarchyRepresentation: { parentId: folderId },
        type: In(types),
        inTrash: false,
      },
      relations: { hierarchyRepresentation: true },
    });
  }

  public async migrateDocuments(): Promise<void> {
    const documents = await this.repo.find({ relations: { hierarchyRepresentation: true } });

    for (const document of documents) {
      document.style = CnDocumentEntity.buildStyle(document.type, document.getExtension());

      const bucketConfig = await this.folderBucketService.getAndCheckFolderBucketConfig(
        document.hierarchyRepresentation.rootParentId
      );
      if (bucketConfig.getFirstBucket().type === 'azureBlob') {
        document.bucketType = BlBucketType.AZURE;
      } else if (bucketConfig.getFirstBucket().type === 'lab') {
        document.bucketType = BlBucketType.LAB;
      } else {
        document.bucketType = BlBucketType.NORMAL;
      }
      await this.repo.save(document);
    }
  }
}
