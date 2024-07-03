import { Injectable } from '@nestjs/common';
import {
  BlAbstractService,
  BlBadRequestException,
  BlBucketType,
  BlFile,
  BlFileHelper,
  BlImageHelper,
  BlNewRichText,
  BlObjectStorageService,
  BlRichTextContent,
  BlRichTextUploadedImageResponse,
  BlRichTextUploadFileResponse
} from '@monorepo/back-core-lib';
import { CnProject } from '../cn-projects/cn-project.entity';
import { IncomingMessage } from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { ClDateHelper, ClPage, ClStringHelper } from '@monorepo/core-lib';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnProjectBucketService } from '../cn-projects/cn-project-bucket.service';
import { CnProjectDocument, CnProjectDocumentType } from './cn-project-document.entity';
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

@Injectable()
export class CnProjectDocumentService extends BlAbstractService<CnProjectDocument> {

  constructor(@InjectRepository(CnProjectDocument) private repository: Repository<CnProjectDocument>,
              private objectStorageService: BlObjectStorageService,
              private projectBucketService: CnProjectBucketService,
              private datasource: DataSource,
              private eventEmitter: EventEmitter2,
              private configService: CnCoreConfigService) {
    super(repository, CnProjectDocument);
  }


  //////////////////////////////////// GENERIC DOCUMENT //////////////////////////////////////////

  /**
   * Upload a document to a project bucket
   * @param file
   * @param project
   * @param documentType
   * @param entityId
   * @param documentName if not provided, a name is generated with the extension
   * @param parentDocument
   */
  public async uploadDocument(file: BlFile, project: CnProject,
                              documentType: CnProjectDocumentType,
                              entityId: string,
                              documentName?: string,
                              parentDocument?: CnProjectDocument): Promise<CnProjectDocument> {
    // check if the space storage is not full, consider si of this document as 0
    this.checkIfStorageIsFull(file.size);

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());

    if (documentName) {

      const existingDocument = await this.findDocumentByProjectAndTypeAndName(project.id, documentType,
        documentName, entityId);
      if (existingDocument) {
        throw new BlBadRequestException(CnErrorText.DOCUMENT_ALREADY_EXIST);
      }
    } else {
      documentName = this.objectStorageService.generateRandomFileNameFromExtension(BlFileHelper.getFileExtension(file.originalname));
    }

    const document = await this.datasource.transaction(async (entityManager) => {

      const document = new CnProjectDocument();
      document.name = documentName;
      document.project = project;
      document.size = file.size;
      document.mimeType = file.mimetype;
      document.type = documentType;
      document.entityId = entityId;
      document.parentDocument = parentDocument;
      // for lab as bucket type, keep the original name
      if (bucketConfig.some(b => b.bucketType === 'LAB') && documentType === CnProjectDocumentType.UPLOADED_DOCUMENT) {
        document.filename = file.originalname;
      } else {
        // otherwise this is a cloud bucket where every file is so we need to generate a random name
        document.filename = this.objectStorageService.generateRandomFileNameFromExtension(BlFileHelper.getFileExtension(documentName));
      }

      const dbDocument = await entityManager.save(document);

      const filePath = this.generateDocumentFilePath(project, document);
      await this.objectStorageService.uploadObject(bucketConfig, file,
        { filename: filePath });
      return dbDocument;
    });

    this.emitEvent('CREATE_DOCUMENT', document);
    return document;
  }

  public async uploadImageDocument(file: BlFile, project: CnProject,
                                   documentType: CnProjectDocumentType,
                                   entityId: string,
                                   documentName?: string,
                                   parentDocument?: CnProjectDocument): Promise<BlRichTextUploadedImageResponse> {
    const imSize = BlImageHelper.getImageSize(file);
    if (!documentName) {
      documentName = this.objectStorageService.generateRandomFileNameFromExtension(imSize.type);
    }
    const imageDoc = await this.uploadDocument(file, project,
      documentType, entityId, documentName, parentDocument);


    return {
      filename: imageDoc.name,
      height: imSize.height,
      width: imSize.width
    };
  }


  async getDocumentContentByTypeAndName(project: CnProject, documentType: CnProjectDocumentType,
                                        documentName: string, entityId: string): Promise<IncomingMessage> {
    const document = await this.findDocumentByProjectAndTypeAndName(project.id, documentType,
      documentName, entityId);

    if (document == null) {
      throw new BlBadRequestException('Document not found');
    }

    return this.getDocumentContentByDocument(project, document);
  }

  public async getDocumentContentByDocument(project: CnProject, document: CnProjectDocument): Promise<IncomingMessage> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectMainBucketConfig(project.getRootParentId());
    return this.objectStorageService.getObject(bucketConfig, this.generateDocumentFilePath(project, document));
  }


  public async deleteDocument(id: string, entityManager: EntityManager): Promise<void> {
    const document = await this.findByIdAndCheck(id, { project: true });

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(document.project.getRootParentId());
    if (document.documentTypeSupportsTrash() && !document.inTrash) {
      throw new BlBadRequestException('Document is not in trash, please move it to trash first');
    }

    const documentsToDelete: CnProjectDocument[] = [document];
    // delete the children document as well
    const children = await this.repo.find({
      where: {
        projectId: document.projectId,
        parentDocument: { id: document.id }
      }
    });

    documentsToDelete.unshift(...children);


    for (const doc of documentsToDelete) {
      await entityManager.remove(doc);
    }

    // delete all object in the store
    const documentPaths = documentsToDelete.map(d => this.generateDocumentFilePath(document.project, d));
    await this.objectStorageService.deleteMultipleObjects(bucketConfig, documentPaths);

    this.emitEvent('DELETE_DOCUMENT', document);
  }

  public async emptyProjectTrash(projectId: string): Promise<void> {
    const documentToDelete = await this.repo.find({ where: { projectId: projectId, inTrash: true } });

    for (const doc of documentToDelete) {
      await this.deleteDocument(doc.id, this.datasource.manager);
    }
  }

  async renameDocument(document: CnProjectDocument, newName: string): Promise<CnProjectDocument> {
    document.name = newName;
    return this.repo.save(document);
  }

  /**
   * Find the document based on its type, project and name.
   * Using the entityId make sure that the requested document is associated to the entity and so
   * this prevents access to a document of another entity
   * @param projectId
   * @param type
   * @param name
   * @param entityId
   */
  async findDocumentByProjectAndTypeAndName(projectId: string, type: CnProjectDocumentType,
                                            name: string, entityId: string): Promise<CnProjectDocument | null> {
    return this.repo.findOne({ where: { projectId: projectId, type: type, name: name, entityId: entityId } });
  }

  public findDocumentsByProject(projectId: string): Promise<CnProjectDocument[]> {
    return this.repo.find({ where: { projectId: projectId } });
  }

  public generateDocumentFilePath(project: CnProject, document: CnProjectDocument): string {
    let prefix = `${project.spaceId}/${project.getRootParentId()}/${project.id}/${document.getTypePrefix()}`;

    if (document.type === CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT ||
      document.type === CnProjectDocumentType.REPORT_CONTENT) {
      prefix += `/${document.entityId}`;
    }

    return `${prefix}/${document.filename}`;
  }


  ////////////////////////////////////////////// PROJECT DOCUMENTS  //////////////////////////////////////////////


  /**
   * List the Uploaded and Constellab documents of a project
   */
  public getProjectDocuments(projectId: string, inTrash: boolean, page: number, size: number): Promise<ClPage<CnProjectDocument>> {
    return this.findPaginated(page, size, {
      where: {
        project: { id: projectId },
        inTrash: inTrash,
        type: In([CnProjectDocumentType.UPLOADED_DOCUMENT, CnProjectDocumentType.CONSTELLAB_DOCUMENT])
      },
      order: {
        lastModifiedAt: 'DESC' as any
      }
    });
  }


  ////////////////////////////////////////////// JSON  DOCUMENTS //////////////////////////////////////////////
  public async createJSONDocument(project: CnProject, type: CnProjectDocumentType,
                                  documentName: string, entityId: string, content: any,
                                  parentDocument?: CnProjectDocument): Promise<CnProjectDocument> {
    // check if the space storage is not full, consider size of this document as 0
    this.checkIfStorageIsFull(0);

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());
    const document = await this.datasource.transaction(async (entityManager) => {

      const document = new CnProjectDocument();
      document.name = documentName;
      document.project = project;
      document.mimeType = 'application/json';
      document.type = type;
      document.filename = this.objectStorageService.generateRandomFileNameFromExtension(BlFileHelper.getFileExtension('json'));
      document.entityId = entityId;
      document.parentDocument = parentDocument;

      const documentPath = this.generateDocumentFilePath(project, document);
      await this.objectStorageService.uploadJson(bucketConfig, content, { filename: documentPath });

      const objectInfo = await this.objectStorageService.getObjectInfo(bucketConfig[0], documentPath);
      document.size = objectInfo.ContentLength;

      return await entityManager.save(document);
    });

    this.emitEvent('CREATE_DOCUMENT', document);
    return document;
  }

  public async updateJSONDocument(project: CnProject, document: CnProjectDocument,
                                  content: any): Promise<CnProjectDocument> {
    // check if the space storage is not full, consider si of this document as 0
    this.checkIfStorageIsFull(0);

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());

    const documentPath = this.generateDocumentFilePath(project, document);
    await this.objectStorageService.uploadJson(bucketConfig, content, { filename: documentPath });

    const objectInfo = await this.objectStorageService.getObjectInfo(bucketConfig[0], documentPath);

    // update the document size and last modification info
    document.size = objectInfo.ContentLength;
    document = await this.repository.save(document);

    this.emitEvent('UPDATE_DOCUMENT', document);
    return document;
  }

  public async createOrUpdateJSONDocument(project: CnProject, type: CnProjectDocumentType,
                                          documentName: string, entityId: string, content: any,
                                          parentDocument?: CnProjectDocument): Promise<CnProjectDocument> {
    const document = await this.findDocumentByProjectAndTypeAndName(project.id, type,
      documentName, entityId);

    if (document) {
      return this.updateJSONDocument(project, document, content);
    } else {
      return this.createJSONDocument(project, type, documentName, entityId, content, parentDocument);
    }
  }

  public async getJSONDocumentContent(project: CnProject, document: CnProjectDocument): Promise<any> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectMainBucketConfig(project.getRootParentId());

    const documentPath = this.generateDocumentFilePath(project, document);
    return await this.objectStorageService.getObjectAsJson(bucketConfig, documentPath);
  }

  ////////////////////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////////////

  public async createConstellabDocument(project: CnProject, documentName: string): Promise<CnConstellabDocumentDTO> {
    const content = BlNewRichText.emptyContent();
    const doc = await this.createJSONDocument(project, CnProjectDocumentType.CONSTELLAB_DOCUMENT,
      documentName, project.id, BlNewRichText.emptyContent());
    return new CnConstellabDocumentDTO(doc, content);
  }


  async updateConstellabDocument(project: CnProject, document: CnProjectDocument,
                                 content: BlRichTextContent): Promise<CnConstellabDocumentDTO> {
    const newDoc = await this.updateJSONDocument(project, document, content);
    return new CnConstellabDocumentDTO(newDoc, content);
  }


  async getConstellabDocument(project: CnProject, document: CnProjectDocument): Promise<CnConstellabDocumentDTO> {
    if (document.type !== CnProjectDocumentType.CONSTELLAB_DOCUMENT) {
      throw new BlBadRequestException('The document is not a constellab document');
    }
    const content = await this.getJSONDocumentContent(project, document);
    return new CnConstellabDocumentDTO(document, content);
  }

  async uploadImageToConstellabDocument(project: CnProject, document: CnProjectDocument,
                                        file: BlFile): Promise<BlRichTextUploadedImageResponse> {
    return this.uploadImageDocument(file, project, CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT,
      document.id, null, document);
  }

  async uploadFileToConstellabDocument(project: CnProject, document: CnProjectDocument,
                                       file: BlFile): Promise<BlRichTextUploadFileResponse> {

    const fileName = await this.checkNewDocumentName(project.id,
      CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT, file.originalname, document.id);

    const newDocument = await this.uploadDocument(file, project,
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

  public async getStorageSizeDetailByProjects(projectIds: string[]): Promise<CnProjectStorageUsageDTO> {
    const documents = await this.repository.findBy({ projectId: In(projectIds) });
    return this.documentsToAggregateDTO(documents);
  }


  public async getStorageSizeDetailBySpace(spaceId: string): Promise<CnProjectStorageUsageDTO> {
    const documents = await this.repository.findBy({ project: { spaceId: spaceId } });
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
    // calculate with sql sum query, join project table with document.projectId = project.id
    const result = await this.repository.manager.query(`
      SELECT SUM(size) as totalSize
      FROM project_document
             JOIN project ON project_document.projectId = project.id
      WHERE project.spaceId = ?
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
      const token = ClStringHelper.generateUUID();
      document.previewToken = ClStringHelper.generateUUID();
      // set expiration in 1 hour
      document.previewTokenExpiration = ClDateHelper.getDate().plus({ hours: 1 });
      document = await this.repo.save(document);
    }

    // Generate the preview URL that use office online viewer with public api route
    const officePreviewUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=';
    const constellabPreviewUrl = `${this.configService.getApiUrl()}/projects/document/preview/${document.previewTokenExpiration}`;
    return new CnProjectDocumentPreviewDTO(`${officePreviewUrl}${constellabPreviewUrl}`);
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
  private async checkNewDocumentName(projectId: string, documentType: CnProjectDocumentType, documentName: string,
                                     entityId: string): Promise<string> {
    let i = 0;
    while (i < 10) {
      const name = i === 0 ? documentName : BlFileHelper.addIndexToFileName(documentName, i);

      const existingDocument = await this.findDocumentByProjectAndTypeAndName(projectId, documentType,
        name, entityId);
      if (!existingDocument) {
        return name;
      }
      i++;
    }

    throw new BlBadRequestException('Document with this name already exists');

  }
}
