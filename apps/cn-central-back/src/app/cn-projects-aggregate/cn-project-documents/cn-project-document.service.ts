import { Injectable, Logger } from '@nestjs/common';
import {
  BlAbstractService,
  BlBadRequestException,
  BlBucketConfig,
  BlBucketType,
  BlFile,
  BlFileHelper,
  BlFileResponse,
  BlImageHelper,
  BlNewRichText,
  BlObjectStorageService,
  BlRichTextContent,
  BlRichTextUploadedImageResponse,
  BlRichTextUploadFileResponse
} from '@monorepo/back-core-lib';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { ClDateHelper, ClPage, ClStringHelper } from '@monorepo/core-lib';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnProjectBucketService } from '../cn-projects/cn-project-bucket.service';
import {
  CnProjectDocument,
  CnProjectDocumentEntity,
  CnProjectDocumentType,
  CnProjectDocumentWithHierarchy
} from './cn-project-document.entity';
import {
  CnConstellabDocumentDTO,
  CnProjectDocumentPreviewDTO,
  CnProjectDocumentStorageType,
  CnProjectStorageUsageDTO
} from './cn-project-document-dto.class';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CnProjectDocumentEvent,
  cnProjectDocumentEventName,
  CnProjectDocumentEventType
} from './cn-project-document.event';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {
  CnFolderHierarchy,
  CnFolderHierarchyEntity,
  CnFolderObjectType
} from '../cn-folder-hierarchies/cn-folder-hierarchy.entity';
import { CnFolderHierarchyService } from '../cn-folder-hierarchies/cn-folder-hierarchy.service';

interface CnDocumentS3Tags {
  name: string;
  folder: string;
}

@Injectable()
export class CnProjectDocumentService extends BlAbstractService<CnProjectDocumentEntity> {
  protected readonly logger = new Logger(CnProjectDocumentService.name);

  public static readonly OFFICE_PREVIEW_URL = 'https://view.officeapps.live.com/op/embed.aspx?src=';

  constructor(@InjectRepository(CnProjectDocumentEntity) private repository: Repository<CnProjectDocumentEntity>,
              private objectStorageService: BlObjectStorageService,
              private projectBucketService: CnProjectBucketService,
              private datasource: DataSource,
              private eventEmitter: EventEmitter2,
              private configService: CnCoreConfigService,
              private folderHierarchyService: CnFolderHierarchyService) {
    super(repository, CnProjectDocumentEntity);
  }


  //////////////////////////////////// GENERIC DOCUMENT //////////////////////////////////////////

  /**
   * Upload a document to a project bucket
   * @param file
   * @param parentFolder
   * @param documentType
   * @param entityId
   * @param documentName if not provided, a name is generated with the extension
   * @param parentDocument
   */
  public async uploadDocument(file: BlFile, parentFolder: CnFolderHierarchy,
                              documentType: CnProjectDocumentType,
                              entityId: string,
                              documentName?: string,
                              parentDocument?: CnProjectDocument): Promise<CnProjectDocument> {
    // check if the space storage is not full, consider size of this document as 0
    this.checkIfStorageIsFull(file.size);

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(parentFolder.getRootFolderId());

    if (documentName) {

      const existingDocument = await this.findDocumentBYTypeAndNameAndEntity(documentType, documentName, entityId);
      if (existingDocument) {
        throw new BlBadRequestException(CnErrorText.DOCUMENT_ALREADY_EXIST);
      }
    } else {
      documentName = this.objectStorageService.generateRandomFileNameFromExtension(BlFileHelper.getFileExtension(file.originalname));
    }

    const document = await this.datasource.transaction(async (entityManager) => {

      const document = new CnProjectDocumentEntity();
      document.name = documentName;

      if (documentType === CnProjectDocumentType.UPLOADED_DOCUMENT) {
        // document that are not uploaded document are considered as hidden document
        document.folderHierarchy = CnFolderHierarchyEntity.newSubFolderHierarchyEntity(CnFolderObjectType.DOCUMENT, documentName,
          CnCurrentUserHelper.getAndCheckCurrentUser(), ClDateHelper.getDate(), parentFolder);
      }
      document.size = file.size;
      document.mimeType = file.mimetype;
      document.type = documentType;
      document.entityId = entityId;
      document.parentDocument = parentDocument as CnProjectDocumentEntity;
      // otherwise this is a cloud bucket where every file is so we need to generate a random name
      document.filename = this.objectStorageService.generateRandomFileNameFromExtension(BlFileHelper.getFileExtension(documentName));


      const dbDocument = await entityManager.save(document);

      await this.objectStorageService.uploadObject(bucketConfig, file,
        { filename: document.filename, tags: this.getTags(document.name, parentFolder.id) } as any);
      return dbDocument;
    });

    this.emitEvent('CREATE_DOCUMENT', document);
    return document;
  }

  public async uploadImageDocument(file: BlFile, parentFolder: CnFolderHierarchy,
                                   documentType: CnProjectDocumentType,
                                   entityId: string,
                                   documentName?: string,
                                   parentDocument?: CnProjectDocument): Promise<BlRichTextUploadedImageResponse> {
    const imSize = BlImageHelper.getImageSize(file);
    if (!documentName) {
      documentName = this.objectStorageService.generateRandomFileNameFromExtension(imSize.type);
    }
    const imageDoc = await this.uploadDocument(file, parentFolder,
      documentType, entityId, documentName, parentDocument);


    return {
      filename: imageDoc.name,
      height: imSize.height,
      width: imSize.width
    };
  }


  async getDocumentContentByTypeAndName(rootFolderId: string, documentType: CnProjectDocumentType,
                                        documentName: string, entityId: string): Promise<BlFileResponse> {
    const document = await this.findDocumentBYTypeAndNameAndEntity(documentType, documentName, entityId);

    if (document == null) {
      throw new BlBadRequestException('Document not found');
    }

    return this.getDocumentContentByDocument(rootFolderId, document);
  }


  public async getDocumentContentByDocument(rootFolderId: string, document: CnProjectDocument): Promise<BlFileResponse> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectMainBucketConfig(rootFolderId);
    return this.objectStorageService.downloadObject(bucketConfig, document.filename);
  }


  public async deleteDocument(id: string, entityManager?: EntityManager): Promise<void> {
    entityManager = this.getEntityManager(entityManager);
    const document = await this.findByIdAndCheck(id, { folderHierarchy: { parent: true } }, entityManager);

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(document.folderHierarchy.getRootFolderId());
    if (document.documentTypeSupportsTrash() && !document.inTrash) {
      throw new BlBadRequestException('Document is not in trash, please move it to trash first');
    }

    const documentsToDelete: CnProjectDocumentWithHierarchy[] = [document];
    // delete the children document as well
    const children = await this.findChildrenDocuments(document.id);
    documentsToDelete.unshift(...children);


    for (const doc of documentsToDelete) {
      await entityManager.remove(doc);
      await entityManager.remove(doc.folderHierarchy);
    }

    // delete all object in the store
    const documentFilenames = documentsToDelete.map(d => d.filename);
    await this.objectStorageService.deleteMultipleObjects(bucketConfig, documentFilenames);

    this.emitEvent('DELETE_DOCUMENT', document);
  }

  public async emptyFolderTrash(parentFolderId: string): Promise<void> {
    const documentToDelete = await this.repo.find({
      where: {
        folderHierarchy: { parentId: parentFolderId },
        inTrash: true
      }
    });

    for (const doc of documentToDelete) {
      await this.deleteDocument(doc.id, this.datasource.manager);
    }
  }

  async renameDocument(rootFolderId: string, document: CnProjectDocument, newName: string): Promise<CnProjectDocument> {

    return this.datasource.transaction(async (entityManager) => {
      document.name = newName;
      document = await entityManager.save(document);

      const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(rootFolderId);
      const tags: Partial<CnDocumentS3Tags> = { name: newName };
      await this.objectStorageService.setObjectTags(bucketConfig, document.filename, tags);

      return document;
    });


  }

  /**
   * Find the document based on its type, parentFolder and name.
   * Using the entityId make sure that the requested document is associated to the entity and so
   * this prevents access to a document of another entity
   * @param type
   * @param name
   * @param entityId
   */
  async findDocumentBYTypeAndNameAndEntity(type: CnProjectDocumentType,
                                           name: string, entityId: string): Promise<CnProjectDocument | null> {
    return this.repo.findOne({
      where: {
        type: type,
        name: name,
        entityId: entityId
      }
    });
  }


  ////////////////////////////////////////////// PROJECT DOCUMENTS  //////////////////////////////////////////////


  public findDocumentsByParentFolder(parentFolderId: string): Promise<CnProjectDocument[]> {
    return this.repo.find({ where: { folderHierarchy: { parentId: parentFolderId } } });
  }

  public findWithHierarchyByIdAndCheck(documentId: string): Promise<CnProjectDocumentWithHierarchy> {
    return this.findByIdAndCheck(documentId, { folderHierarchy: true });
  }

  private findChildrenDocuments(parentDocumentId: string): Promise<CnProjectDocumentWithHierarchy[]> {
    return this.repo.find({
      where: { parentDocument: { id: parentDocumentId } },
      relations: { folderHierarchy: true }
    });
  }

  /**
   * List the Uploaded and Constellab documents of a parentFolder
   */
  public getParentFolderDocuments(parentFolderId: string, inTrash: boolean, page: number, size: number): Promise<ClPage<CnProjectDocument>> {
    return this.findPaginated(page, size, {
      where: {
        folderHierarchy: { parentId: parentFolderId },
        inTrash: inTrash,
        type: In([CnProjectDocumentType.UPLOADED_DOCUMENT, CnProjectDocumentType.CONSTELLAB_DOCUMENT])
      },
      order: {
        createdAt: 'DESC' as any
      }
    });
  }


  ////////////////////////////////////////////// JSON  DOCUMENTS //////////////////////////////////////////////
  public async createJSONDocument(parentFolder: CnFolderHierarchy, type: CnProjectDocumentType,
                                  documentName: string, entityId: string, content: any,
                                  parentDocument?: CnProjectDocument): Promise<CnProjectDocument> {
    // check if the space storage is not full, consider size of this document as 0
    this.checkIfStorageIsFull(0);

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(parentFolder.getRootFolderId());
    const document = await this.datasource.transaction(async (entityManager) => {

      const document = new CnProjectDocumentEntity();
      document.name = documentName;

      if (type === CnProjectDocumentType.CONSTELLAB_DOCUMENT) {
        // document that are not Constellab document are considered as hidden document
        document.folderHierarchy = CnFolderHierarchyEntity.newSubFolderHierarchyEntity(CnFolderObjectType.CONSTELLAB_DOCUMENT, documentName, CnCurrentUserHelper.getAndCheckCurrentUser(),
          ClDateHelper.getDate(), parentFolder);
      }
      document.mimeType = 'application/json';
      document.type = type;
      document.filename = this.objectStorageService.generateRandomFileNameFromExtension(BlFileHelper.getFileExtension('json'));
      document.entityId = entityId;
      document.parentDocument = parentDocument as CnProjectDocumentEntity;

      await this.objectStorageService.uploadJson(bucketConfig, content, { filename: document.filename });

      const objectInfo = await this.objectStorageService.getObjectInfo(bucketConfig[0], document.filename);
      document.size = objectInfo.size;

      return await entityManager.save(document);
    });

    this.emitEvent('CREATE_DOCUMENT', document);
    return document;
  }

  public async updateJSONDocument(rootFolderId: string, document: CnProjectDocument,
                                  content: any): Promise<CnProjectDocument> {
    // check if the space storage is not full, consider si of this document as 0
    this.checkIfStorageIsFull(0);

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(rootFolderId);

    await this.objectStorageService.uploadJson(bucketConfig, content, { filename: document.filename });

    const objectInfo = await this.objectStorageService.getObjectInfo(bucketConfig[0], document.filename);

    // update the document size and last modification info
    document.size = objectInfo.size;
    document = await this.repository.save(document);

    this.emitEvent('UPDATE_DOCUMENT', document);
    return document;
  }

  public async createOrUpdateJSONDocument(parentFolder: CnFolderHierarchy, type: CnProjectDocumentType,
                                          documentName: string, entityId: string, content: any,
                                          parentDocument?: CnProjectDocument): Promise<CnProjectDocument> {
    const document = await this.findDocumentBYTypeAndNameAndEntity(type, documentName, entityId);

    if (document) {
      return this.updateJSONDocument(parentFolder.getRootFolderId(), document, content);
    } else {
      return this.createJSONDocument(parentFolder, type, documentName, entityId, content, parentDocument);
    }
  }

  public async getJSONDocumentContent(rootFolderId: string, document: CnProjectDocument): Promise<any> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectMainBucketConfig(rootFolderId);

    return await this.objectStorageService.getObjectAsJson(bucketConfig, document.filename);
  }

  ////////////////////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////////////

  public async createConstellabDocument(parentFolder: CnFolderHierarchy, documentName: string): Promise<CnConstellabDocumentDTO> {
    const content = BlNewRichText.emptyContent();
    const doc = await this.createJSONDocument(parentFolder, CnProjectDocumentType.CONSTELLAB_DOCUMENT,
      documentName, parentFolder.id, BlNewRichText.emptyContent());
    return new CnConstellabDocumentDTO(doc, content);
  }


  async updateConstellabDocument(rootFolderId: string, document: CnProjectDocument,
                                 content: BlRichTextContent): Promise<CnConstellabDocumentDTO> {
    const newDoc = await this.updateJSONDocument(rootFolderId, document, content);
    return new CnConstellabDocumentDTO(newDoc, content);
  }


  async getConstellabDocument(rootFolderId: string, document: CnProjectDocument): Promise<CnConstellabDocumentDTO> {
    if (document.type !== CnProjectDocumentType.CONSTELLAB_DOCUMENT) {
      throw new BlBadRequestException('The document is not a constellab document');
    }
    const content = await this.getJSONDocumentContent(rootFolderId, document);
    return new CnConstellabDocumentDTO(document, content);
  }

  async uploadImageToConstellabDocument(parentFolder: CnFolderHierarchy, document: CnProjectDocument,
                                        file: BlFile): Promise<BlRichTextUploadedImageResponse> {
    return this.uploadImageDocument(file, parentFolder, CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT,
      document.id, null, document);
  }

  async uploadFileToConstellabDocument(parentFolder: CnFolderHierarchy, document: CnProjectDocument,
                                       file: BlFile): Promise<BlRichTextUploadFileResponse> {

    const fileName = await this.checkNewDocumentName(CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT, file.originalname, document.id);

    const newDocument = await this.uploadDocument(file, parentFolder,
      CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT,
      document.id, fileName, document);

    return {
      name: newDocument.name,
      size: newDocument.size
    };
  }

  ////////////////////////////////////////////// TRASH ///////////////////////////////////////////////
  public async moveToTrash(document: CnProjectDocument): Promise<CnProjectDocument> {
    document.inTrash = true;
    return await this.repo.save(document);
  }

  public async restoreFromTrash(document: CnProjectDocument): Promise<CnProjectDocument> {
    document.inTrash = false;
    return await this.repo.save(document);
  }

  ////////////////////////////////////////////// SIZE /////////////////////////////////////////////

  public async getStorageSizeDetailByFolders(folderIds: string[]): Promise<CnProjectStorageUsageDTO> {
    const documents = await this.repository.findBy({ folderHierarchy: { parentId: In(folderIds) } });
    return this.documentsToAggregateDTO(documents);
  }


  public async getStorageSizeDetailBySpace(spaceId: string): Promise<CnProjectStorageUsageDTO> {
    const documents = await this.repository.findBy({ folderHierarchy: { spaceId: spaceId } });
    return this.documentsToAggregateDTO(documents);
  }

  private documentsToAggregateDTO(documents: CnProjectDocument[]): CnProjectStorageUsageDTO {
    const aggregationDTO: CnProjectStorageUsageDTO = new CnProjectStorageUsageDTO();

    const mappings: Record<CnProjectDocumentType, CnProjectDocumentStorageType> = {
      [CnProjectDocumentType.UPLOADED_DOCUMENT]: CnProjectDocumentStorageType.UPLOADED_DOCUMENT,
      [CnProjectDocumentType.CONSTELLAB_DOCUMENT]: CnProjectDocumentStorageType.CONSTELLAB_DOCUMENT,
      [CnProjectDocumentType.DESCRIPTION_CONTENT]: CnProjectDocumentStorageType.DESCRIPTION,
      [CnProjectDocumentType.REPORT]: CnProjectDocumentStorageType.REPORT,
      [CnProjectDocumentType.REPORT_CONTENT]: CnProjectDocumentStorageType.REPORT,
      [CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT]: CnProjectDocumentStorageType.CONSTELLAB_DOCUMENT,
      [CnProjectDocumentType.COMMENT_CONTENT]: CnProjectDocumentStorageType.COMMENT
    };

    for (const doc of documents) {
      const type = mappings[doc.type];
      aggregationDTO.addDocumentSize(type, doc.size, doc.bucketType);
    }

    return aggregationDTO;
  }

  public async getSpaceCloudStorageSize(spaceId: string): Promise<number> {
    // calculate with sql sum query, join parentFolder table with document.folderId = folder.id
    const result = await this.repository.manager.query(`
      SELECT SUM(size) as totalSize
      FROM project_document
             JOIN folder_hierarchy ON project_document.id = folder_hierarchy.id
      WHERE folder_hierarchy.spaceId = ?
        and project_document.bucketType = ?
    `, [spaceId, BlBucketType.NORMAL]);
    return result[0].totalSize ?? 0;
  }

  public checkIfStorageIsFull(documentSize: number): void {
    const space = CnCurrentUserHelper.getAndCheckCurrentSpace();
    if (!space.hasEnoughStorageForNewFile(documentSize)) {
      if (documentSize === 0) {
        throw new BlBadRequestException('Space storage is full, please contact your ' +
          'space administrator to increase the storage limit, delete some documents or empty the trash.');
      } else {
        throw new BlBadRequestException('There is not enough remaining free storage in ' +
          'your space to upload this document. Please contact your space administrator to increase the storage limit, ' +
          'delete some documents or empty the trash.');
      }
    }
  }

  ////////////////////////////////////////////// PREVIEW  /////////////////////////////////////////////

  public async generatePreviewToken(document: CnProjectDocument): Promise<CnProjectDocumentPreviewDTO> {
    if (!document.canTokenPreview) {
      throw new BlBadRequestException('This document cannot be previewed');
    }
    // don't generate the token if the last token is still valid with 10 minutes margin
    if (document.previewTokenExpiration < ClDateHelper.getDate().plus({ minutes: 10 })) {
      document.previewToken = ClStringHelper.generateUUID();
      // set expiration in 1 hour
      document.previewTokenExpiration = ClDateHelper.getDate().plus({ hours: 1 });
      document = await this.repo.save(document);
    }

    // Generate the preview URL that use office online viewer with public api route
    const constellabPreviewUrl = `${this.configService.getApiUrl()}/projects/document/preview/${document.previewToken}`;
    return new CnProjectDocumentPreviewDTO(`${CnProjectDocumentService.OFFICE_PREVIEW_URL}${constellabPreviewUrl}`);
  }

  public async getAndCheckByPreviewToken(token: string): Promise<CnProjectDocument> {
    const document = await this.repo.findOne({ where: { previewToken: token } });
    if (!document) {
      throw new BlBadRequestException('Document not found');
    }

    if (document.previewTokenExpiration < ClDateHelper.getDate()) {
      throw new BlBadRequestException('Preview token has expired');
    }

    return document;
  }

  ////////////////////////////////////////////// OTHERS /////////////////////////////////////////////

  public async moveDocument(document: CnProjectDocumentWithHierarchy,
                            oldParentFolder: CnFolderHierarchy,
                            newParentFolder: CnFolderHierarchy): Promise<CnProjectDocumentWithHierarchy> {
    const oldBuckets = await this.projectBucketService.getAndCheckProjectBucketConfig(oldParentFolder.getRootFolderId());
    const newBuckets = await this.projectBucketService.getAndCheckProjectBucketConfig(newParentFolder.getRootFolderId());

    // move the children document as well
    const children = await this.findChildrenDocuments(document.id);
    const newDocument = await this.moveDocumentFromBucket(document, newParentFolder, oldBuckets, newBuckets);

    // also move the children
    for (const doc of children) {
      await this.moveDocumentFromBucket(doc, newParentFolder, oldBuckets, newBuckets);
    }

    return newDocument;
  }

  private async moveDocumentFromBucket(document: CnProjectDocumentWithHierarchy,
                                       newParentFolder: CnFolderHierarchy,
                                       oldBuckets: BlBucketConfig[], newBuckets: BlBucketConfig[]): Promise<CnProjectDocumentWithHierarchy> {
    return await this.datasource.transaction(async (entityManager) => {
      entityManager = this.getEntityManager(entityManager);
      document.folderHierarchy.parentId = newParentFolder.id;
      document.folderHierarchy.parent = newParentFolder as CnFolderHierarchyEntity;
      document.folderHierarchy.rootParentId = newParentFolder.getRootFolderId();
      await this.folderHierarchyService.update(document.folderHierarchy, entityManager);

      // move the object in the storage is needed
      if (this.objectStorageService.areSameBuckets(oldBuckets, newBuckets)) {
        // update the project tag
        await this.objectStorageService.setObjectTags(newBuckets, document.filename, this.getTags(document.name, newParentFolder.id) as any);
      }else {
        await this.objectStorageService.moveObjectToAnotherBucket(oldBuckets, newBuckets, document.filename, document.filename);
      }
      return document;
    });
  }

  private emitEvent(eventType: CnProjectDocumentEventType, document: CnProjectDocument): void {
    const event: CnProjectDocumentEvent = {
      type: eventType,
      entity: document,
      spaceId: CnCurrentUserHelper.getCurrentSpace().id
    };
    this.eventEmitter.emit(cnProjectDocumentEventName, event);
  }

  /**
   * Method to check if a document with same name exists and if so, add an index to the name
   * @private
   */
  private async checkNewDocumentName(documentType: CnProjectDocumentType, documentName: string,
                                     entityId: string): Promise<string> {
    let i = 0;
    while (i < 10) {
      const name = i === 0 ? documentName : BlFileHelper.addIndexToFileName(documentName, i);

      const existingDocument = await this.findDocumentBYTypeAndNameAndEntity(documentType, name, entityId);
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
      folder: folderId
    };
  }

  // TODO TO REMOVE
  public async migrateDocumentInBucket(): Promise<void> {
    this.logger.log('[START MIGRATION] Migrate bucket objects');

    const documents = await this.repo.find({
      where: { migrated: false },
      relations: { folderHierarchy: { parent: true } }
    });
    let i = 0;
    for (const doc of documents) {
      try {
        const buckets = await this.projectBucketService.getAndCheckProjectBucketConfig(doc.folderHierarchy.rootParentId);
        await this.migrateBucketObject(doc, doc.folderHierarchy.parent, buckets);

        i++;
        this.logger.log(`Migrated document ${i}/${documents.length}`);
      } catch (e) {
        this.logger.error(`Error migrating document ${doc.id}. ${e}`);
      }
    }
    this.logger.log('[END MIGRATION] Migrate bucket objects');
  }

  /**
   * Generate the path of a document in the object storage
   * Path : spaceId/rootParentId/projectId/documentType/entityId/filename
   * @param parentFolder
   * @param document
   */
  public generateDocumentFilePath(parentFolder: CnFolderHierarchy, document: CnProjectDocument): string {
    let prefix = `${parentFolder.spaceId}/${parentFolder.getRootFolderId()}/${parentFolder.id}/${document.getTypePrefix()}`;

    if (document.type === CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT ||
      document.type === CnProjectDocumentType.REPORT_CONTENT) {
      prefix += `/${document.entityId}`;
    }

    return `${prefix}/${document.filename}`;
  }

  private async migrateBucketObject(document: CnProjectDocument,
                                    oldParentFolder: CnFolderHierarchy,
                                    buckets: BlBucketConfig[]): Promise<CnProjectDocument> {
    // move the object in the storage
    const oldFilePath = this.generateDocumentFilePath(oldParentFolder, document);
    await this.objectStorageService.moveObjectToAnotherBucket(buckets, buckets, oldFilePath, document.filename);

    document.migrated = true;
    return this.repo.save(document);
  }
}
