import {Injectable} from '@nestjs/common';
import {
  BlAbstractService,
  BlBadRequestException,
  BlFile,
  BlFileHelper,
  BlImageHelper,
  BlNewRichText,
  BlObjectStorageService,
  BlRichTextContent,
  BlRichTextUploadedImage
} from '@monorepo/back-core-lib';
import {CnProject} from '../cn-projects/cn-project.entity';
import {IncomingMessage} from 'http';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, In, Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {CnProjectBucketService} from '../cn-projects/cn-project-bucket.service';
import {CnProjectDocument, CnProjectDocumentType} from './cn-project-document.entity';
import {
  CnConstellabDocumentDTO,
  CnProjectDocumentStorageType,
  CnProjectStorageUsageDTO
} from './cn-project-document-dto.class';
import {CnDocument} from '../cn-documents/cn-document.entity';
import {EventEmitter2} from '@nestjs/event-emitter';
import {
  CnProjectDocumentEvent,
  cnProjectDocumentEventName,
  CnProjectDocumentEventType
} from './cn-project-document.event';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';

@Injectable()
export class CnProjectDocumentService extends BlAbstractService<CnProjectDocument> {

  constructor(@InjectRepository(CnProjectDocument) private repository: Repository<CnProjectDocument>,
              private objectStorageService: BlObjectStorageService,
              private projectBucketService: CnProjectBucketService,
              private datasource: DataSource,
              private eventEmitter: EventEmitter2) {
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
      if (bucketConfig.some(b => b.bucketType === 'LAB')) {
        document.filename = file.originalname;
      } else {
        // otherwise this is a cloud bucket where every file is so we need to generate a random name
        document.filename = this.objectStorageService.generateRandomFileNameFromExtension(BlFileHelper.getFileExtension(documentName));
      }

      const dbDocument = await entityManager.save(document);

      const filePath = this.generateDocumentFilePath(project, document);
      await this.objectStorageService.uploadObject(bucketConfig, file,
        {filename: filePath});
      return dbDocument;
    });

    this.emitEvent('CREATE_DOCUMENT', document);
    return document;
  }

  public async uploadImageDocument(file: BlFile, project: CnProject,
                                   documentType: CnProjectDocumentType,
                                   entityId: string,
                                   documentName?: string,
                                   parentDocument?: CnProjectDocument): Promise<BlRichTextUploadedImage> {
    const imSize = BlImageHelper.getImageSize(file);
    if (!documentName) {
      documentName = this.objectStorageService.generateRandomFileNameFromExtension(imSize.type);
    }
    const imageDoc = await this.uploadDocument(file, project,
      documentType, entityId, documentName, parentDocument);


    return {
      filename: imageDoc.name,
      height: imSize.height,
      width: imSize.width,
    };
  }


  async getDocumentContentByTypeAndName(project: CnProject, documentType: CnProjectDocumentType,
                                        documentName: string, entityId: string): Promise<IncomingMessage> {
    const document = await this.findDocumentByProjectAndTypeAndName(project.id, documentType,
      documentName, entityId);

    if (document == null) {
      throw new BlBadRequestException('Document not found');
    }

    const bucketConfig = await this.projectBucketService.getAndCheckProjectMainBucketConfig(project.getRootParentId());
    return this.objectStorageService.getObject(bucketConfig, this.generateDocumentFilePath(project, document));
  }


  public async deleteDocument(id: string, entityManager: EntityManager): Promise<void> {
    const document = await this.findByIdAndCheck(id, {project: true});

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(document.project.getRootParentId());
    if (document.documentTypeSupportsTrash() && !document.inTrash) {
      throw new BlBadRequestException('Document is not in trash, please move it to trash first');
    }

    const documentsToDelete: CnProjectDocument[] = [document];
    // delete the children document as well
    if (document.type === CnProjectDocumentType.CONSTELLAB_DOCUMENT) {
      const children = await this.repo.find({
        where: {
          projectId: document.projectId,
          parentDocument: {id: document.id},
        }
      });

      documentsToDelete.push(...children);
    }


    for (const doc of documentsToDelete) {
      await entityManager.remove(doc);
    }

    // delete all object in the store
    const documentPaths = documentsToDelete.map(d => this.generateDocumentFilePath(document.project, d));
    await this.objectStorageService.deleteMultipleObjects(bucketConfig, documentPaths);

    this.emitEvent('DELETE_DOCUMENT', document);
  }

  public async emptyProjectTrash(projectId: string): Promise<void> {
    const documentToDelete = await this.repo.find({where: {projectId: projectId, inTrash: true}});

    for(const doc of documentToDelete){
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
    return this.repo.findOne({where: {projectId: projectId, type: type, name: name, entityId: entityId}});
  }

  public findDocumentsByProject(projectId: string): Promise<CnProjectDocument[]> {
    return this.repo.find({where: {projectId: projectId}});
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
        project: {id: projectId},
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
    // check if the space storage is not full, consider si of this document as 0
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
      await this.objectStorageService.uploadJson(bucketConfig, content, {filename: documentPath});

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
    await this.objectStorageService.uploadJson(bucketConfig, content, {filename: documentPath});

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

  async uploadImageToConstellabDocument(project: CnProject, document: CnProjectDocument, file: BlFile): Promise<BlRichTextUploadedImage> {
    return this.uploadImageDocument(file, project, CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT,
      document.id, null, document);
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
    const documents = await this.repository.findBy({projectId: In(projectIds)});
    return this.documentsToAggregateDTO(documents);
  }

  public async getStorageSizeDetailBySpace(spaceId: string): Promise<CnProjectStorageUsageDTO> {
    const documents = await this.repository.findBy({project: {spaceId: spaceId}});
    return this.documentsToAggregateDTO(documents);
  }

  private documentsToAggregateDTO(documents: CnProjectDocument[]): CnProjectStorageUsageDTO {
    const totalSize = documents.reduce((acc, doc) => acc + doc.size, 0);
    const totalDocuments = documents.length;

    const aggregationDTO: CnProjectStorageUsageDTO = new CnProjectStorageUsageDTO(totalSize, totalDocuments);

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
      const detail = aggregationDTO.details[type];
      detail.totalSize += doc.size;
      detail.totalDocuments++;
    }

    return aggregationDTO;
  }

  public async getSpaceStorageSize(spaceId: string): Promise<number> {
    // calculate with sql sum query, join project table with document.projectId = project.id
    const result = await this.repository.manager.query(`
      SELECT SUM(size) as totalSize
      FROM project_document
             JOIN project ON project_document.projectId = project.id
      WHERE project.spaceId = ?
    `, [spaceId]);
    return result[0].totalSize ?? 0;
  }

  public checkIfStorageIsFull(documentSize: number): void {
    const space = CnCurrentUserHelper.getCurrentSpace();
    if (!space.hasEnoughStorageForNewFile(documentSize)) {
      if (documentSize === 0) {
        throw new BlBadRequestException('Space storage is full, please contact your space administrator to increase the storage limit, delete some documents or empty the trash.');
      } else {
        throw new BlBadRequestException('There is not enough remaining free storage in your space to upload this document. Please contact your space administrator to increase the storage limit, delete some documents or empty the trash.');
      }
    }
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

  ////////////////////////////////////////////// MIGRATION /////////////////////////////////////////////


  // TODO TO REMOVE AFTER MIGRATION
  public async fromDocument(document: CnDocument): Promise<CnProjectDocument> {
    const doc = new CnProjectDocument();
    doc.id = document.id;
    doc.name = document.name;
    doc.filename = document.filename;
    doc.size = document.size;
    doc.mimeType = document.mimeType;
    doc.project = document.project;
    doc.projectId = document.projectId;
    doc.type = document.isConstellabDocument ? CnProjectDocumentType.CONSTELLAB_DOCUMENT : CnProjectDocumentType.UPLOADED_DOCUMENT;
    doc.entityId = document.projectId;
    doc.inTrash = document.inTrash;
    return this.repository.save(doc);
  }

  public save(document: CnProjectDocument): Promise<CnProjectDocument> {
    return this.repository.save(document);
  }

  public async getFileSize(project: CnProject, document: CnProjectDocument): Promise<number> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());

    const documentPath = this.generateDocumentFilePath(project, document);
    const objectInfo = await this.objectStorageService.getObjectInfo(bucketConfig[0], documentPath);

    // update the document size and last modification info
    return objectInfo.ContentLength;
  }

  public async migrateImageContent(filename: string, project: CnProject,
                                   documentType: CnProjectDocumentType,
                                   entityId: string,
                                   parentDocument?: CnProjectDocument): Promise<CnProjectDocument> {
    const imageDocument = await this.findDocumentByProjectAndTypeAndName(project.id,
      documentType, filename, entityId);

    if (!imageDocument) {
      const document = new CnProjectDocument();
      document.name = filename;
      document.filename = filename;

      const extension = BlFileHelper.getFileExtension(filename);
      if (extension === 'png') {
        document.mimeType = 'image/png';
      } else if (extension === 'jpg' || extension === 'jpeg') {
        document.mimeType = 'image/jpeg';
      } else if (extension === 'gif') {
        document.mimeType = 'image/gif';
      } else {
        document.mimeType = 'image/*';
      }
      document.project = project;
      document.projectId = project.id;
      document.type = documentType;
      document.entityId = entityId;
      document.inTrash = false;
      document.parentDocument = parentDocument;
      document.size = await this.getFileSize(project, document);

      return await this.repository.save(document);
    }
    return imageDocument;
  }
}
