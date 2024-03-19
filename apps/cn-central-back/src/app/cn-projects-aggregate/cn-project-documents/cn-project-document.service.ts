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
import {CnConstellabDocument2} from './cn-project-document-dto.class';
import {CnDocument} from '../cn-documents/cn-document.entity';

@Injectable()
export class CnProjectDocumentService extends BlAbstractService<CnProjectDocument> {

  constructor(@InjectRepository(CnProjectDocument) private repository: Repository<CnProjectDocument>,
              private objectStorageService: BlObjectStorageService,
              private projectBucketService: CnProjectBucketService,
              private datasource: DataSource) {
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
    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());

    if (documentName) {

      const existingDocument = await this.findDocumentByProjectAndTypeAndName(project.id, documentType, documentName);
      if (existingDocument) {
        throw new BlBadRequestException(CnErrorText.DOCUMENT_ALREADY_EXIST);
      }
    } else {
      documentName = this.objectStorageService.generateRandomFileNameFromExtension(BlFileHelper.getFileExtension(file.originalname));
    }

    return this.datasource.transaction(async (entityManager) => {

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
        // TODO tester l'extension des images et capture d'écran
        // otherwise this is a cloud bucket where every file is so we need to generate a random name
        document.filename = this.objectStorageService.generateRandomFileNameFromExtension(BlFileHelper.getFileExtension(file.originalname));
      }

      const dbDocument = await entityManager.save(document);

      const filePath = this.generateDocumentFilePath(project, document);
      await this.objectStorageService.uploadObject(bucketConfig, file,
        {filename: filePath});
      return dbDocument;
    });
  }

  public async uploadImageDocument(file: BlFile, project: CnProject,
                                   documentType: CnProjectDocumentType,
                                   entityId: string,
                                   documentName?: string,
                                   parentDocument?: CnProjectDocument): Promise<BlRichTextUploadedImage> {
    const imageDoc = await this.uploadDocument(file, project,
      documentType, entityId, documentName, parentDocument);

    // TODO TO CHECK IF USEFULE
    const imSize = BlImageHelper.getImageSize(file);
    // const filename = this.objectStorageService.generateRandomFileNameFromExtension(imSize.type);

    return {
      filename: imageDoc.filename,
      height: imSize.height,
      width: imSize.width,
    };
  }


  async getDocumentContentByTypeAndName(project: CnProject, documentType: CnProjectDocumentType,
                                        documentName: string): Promise<IncomingMessage> {
    const document = await this.findDocumentByProjectAndTypeAndName(project.id, documentType, documentName);

    if (document == null) {
      throw new BlBadRequestException('Document not found');
    }

    const bucketConfig = await this.projectBucketService.getAndCheckProjectMainBucketConfig(project.getRootParentId());
    return this.objectStorageService.getObject(bucketConfig, this.generateDocumentFilePath(project, document));
  }


  public async deleteDocument(id: string, entityManager: EntityManager): Promise<void> {
    const document = await this.findByIdAndCheck(id, {project: true});

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(document.project.getRootParentId());
    if (!document.inTrash) {
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
  }

  async renameDocument(document: CnProjectDocument, newName: string): Promise<CnProjectDocument> {
    document.name = newName;
    return this.repo.save(document);
  }

  async findDocumentByProjectAndTypeAndName(projectId: string, type: CnProjectDocumentType,
                                            name: string): Promise<CnProjectDocument | null> {
    return this.repo.findOne({where: {projectId: projectId, type: type, name: name}});
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
    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());
    return this.datasource.transaction(async (entityManager) => {

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
  }

  public async updateJSONDocument(project: CnProject, document: CnProjectDocument,
                                  content: any): Promise<CnProjectDocument> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());

    const documentPath = this.generateDocumentFilePath(project, document);
    await this.objectStorageService.uploadJson(bucketConfig, content, {filename: documentPath});

    const objectInfo = await this.objectStorageService.getObjectInfo(bucketConfig[0], documentPath);

    // update the document size and last modification info
    document.size = objectInfo.ContentLength;
    document = await this.repository.save(document);

    return document;
  }

  public async createOrUpdateJSONDocument(project: CnProject, type: CnProjectDocumentType,
                                          documentName: string, entityId: string, content: any,
                                          parentDocument?: CnProjectDocument): Promise<CnProjectDocument> {
    const document = await this.findDocumentByProjectAndTypeAndName(project.id, type, documentName);

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

  public async createConstellabDocument(project: CnProject, documentName: string): Promise<CnConstellabDocument2> {
    const content = BlNewRichText.emptyContent();
    const doc = await this.createJSONDocument(project, CnProjectDocumentType.CONSTELLAB_DOCUMENT,
      documentName, project.id, BlNewRichText.emptyContent());
    return new CnConstellabDocument2(doc, content);
  }


  async updateConstellabDocument(project: CnProject, document: CnProjectDocument,
                                 content: BlRichTextContent): Promise<CnConstellabDocument2> {
    const newDoc = await this.updateJSONDocument(project, document, content);
    return new CnConstellabDocument2(newDoc, content);
  }


  async getConstellabDocument(project: CnProject, document: CnProjectDocument): Promise<CnConstellabDocument2> {
    if (document.type !== CnProjectDocumentType.CONSTELLAB_DOCUMENT) {
      throw new BlBadRequestException('The document is not a constellab document');
    }
    const content = await this.getJSONDocumentContent(project, document);
    return new CnConstellabDocument2(document, content);
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

  public async aggregateProjectsDocumentsSize(projectIds: string[]): Promise<number> {
    const result = await this.repo.createQueryBuilder('document')
      .select('SUM(size)', 'size')
      .where('document.projectId IN (:...projectIds)', {projectIds: projectIds})
      .getRawOne();

    return result.size || 0;
  }

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
      CnProjectDocumentType.REPORT_CONTENT, filename);

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
