import {Injectable} from '@nestjs/common';
import {
  BlAbstractService,
  BlBadRequestException,
  BlFile,
  BlFileHelper,
  BlImageHelper,
  BlObjectStorageService,
  BlRichText,
  BlRichTextI,
  BlRichTextUploadedImage
} from '@monorepo/back-core-lib';
import {CnProject} from '../cn-projects/cn-project.entity';
import {IncomingMessage} from 'http';
import {CnDocument} from './cn-document.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {CnConstellabDocument} from './cn-document-dto.class';
import {CnProjectBucketService} from '../cn-project-bucket/cn-project-bucket.service';

@Injectable()
export class CnDocumentsService extends BlAbstractService<CnDocument> {

  constructor(@InjectRepository(CnDocument) private repository: Repository<CnDocument>,
              private objectStorageService: BlObjectStorageService,
              private projectBucketService: CnProjectBucketService,
              private datasource: DataSource) {
    super(repository, CnDocument);
  }

  public async uploadDocument(file: BlFile, project: CnProject): Promise<CnDocument> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());

    const existingDocument = await this.findDocumentByProjectAndName(project.id, file.originalname);
    if (existingDocument) {
      throw new BlBadRequestException(CnErrorText.DOCUMENT_ALREADY_EXIST);
    }

    return this.datasource.transaction(async (entityManager) => {

      const document = new CnDocument();
      document.name = file.originalname;
      document.project = project;
      document.size = file.size;
      document.mimeType = file.mimetype;
      document.isConstellabDocument = false;

      const extension = BlFileHelper.getFileExtension(file.originalname);
      document.filePath = this.generateDocumentFilePath(project.id, extension);
      const dbDocument = await entityManager.save(document);

      await this.objectStorageService.uploadObject(bucketConfig, file,
        {filename: document.filePath});
      return dbDocument;
    });
  }

  public async getDocument(project: CnProject, filePath: string): Promise<IncomingMessage> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectMainBucketConfig(project.getRootParentId());

    return this.objectStorageService.getObject(bucketConfig, filePath);
  }

  public async deleteDocument(id: string, project: CnProject): Promise<void> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());

    const document = await this.findByIdAndCheck(id);

    if(!document.inTrash){
      throw new BlBadRequestException("Document is not in trash, please move it to trash first");
    }

    return this.datasource.transaction(async (entityManager) => {
      await entityManager.remove(document);
      await this.objectStorageService.deleteObjectIfExist(bucketConfig, document.filePath);

      // if this is a constellab document, delete all images as well
      if (document.isConstellabDocument) {
        const prefix = CnProjectBucketService.getPrefix('CONSTELLAB_DOC_IMAGE', id);
        await this.objectStorageService.deleteObjectsByPrefix(bucketConfig, prefix);
      }
    });
  }

  public getDocumentsByProject(projectId: string, inTrash: boolean, page: number, size: number): Promise<ClPage<CnDocument>> {
    return this.findPaginated(page, size, {
      where: {
        project: {id: projectId},
        inTrash: inTrash
      },
      order: {
        lastModifiedAt: 'DESC' as any
      }
    });
  }

  async findDocumentByProjectAndName(projectId: string, name: string): Promise<CnDocument> {
    return this.repo.findOne({where: {projectId: projectId, name: name}});
  }

  async renameDocument(document: CnDocument, newName: string): Promise<CnDocument> {
    document.name = newName;
    return this.repo.save(document);
  }

  ////////////////////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////////////

  async createConstellabDocument(project: CnProject, filename: string): Promise<CnConstellabDocument> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());
    const content = BlRichText.newRichText();

    return this.datasource.transaction(async (entityManager) => {

      const document = new CnDocument();
      document.name = filename;
      document.project = project;
      document.size = 0;
      document.mimeType = 'application/json';
      document.isConstellabDocument = true;

      document.filePath = this.generateDocumentFilePath(project.id, 'json');
      const dbDocument = await entityManager.save(document);

      await this.objectStorageService.uploadJson(bucketConfig, content, {filename: document.filePath});

      return new CnConstellabDocument(dbDocument, content);
    });
  }

  async updateConstellabDocument(project: CnProject, document: CnDocument, content: BlRichTextI): Promise<CnConstellabDocument> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());

    await this.objectStorageService.uploadJson(bucketConfig[0], content, {filename: document.filePath});

    const objectInfo = await this.objectStorageService.getObjectInfo(bucketConfig[0], document.filePath);

    console.log('super', objectInfo)
    // update the document size and last modification info
    document.size = objectInfo.ContentLength;
    document = await this.repository.save(document);

    return new CnConstellabDocument(document, content);
  }

  async getConstellabDocument(project: CnProject, document: CnDocument): Promise<CnConstellabDocument> {
    if (!document.isConstellabDocument) throw new BlBadRequestException('The document is not a constellab document');
    const bucketConfig = await this.projectBucketService.getAndCheckProjectMainBucketConfig(project.getRootParentId());

    const content = await this.objectStorageService.getObjectAsJson(bucketConfig, document.filePath);

    return new CnConstellabDocument(document, content);
  }

  async uploadImageToConstellabDocument(project: CnProject, document: CnDocument, file: BlFile): Promise<BlRichTextUploadedImage> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());

    const imSize = BlImageHelper.getImageSize(file);
    const filename = this.objectStorageService.generateRandomFileName(BlFileHelper.getFileExtension(file.originalname));
    const filePath = `${CnProjectBucketService.getPrefix('CONSTELLAB_DOC_IMAGE', document.id)}/${filename}`;

    await this.objectStorageService.uploadObject(bucketConfig, file, {filename: filePath});

    return {
      filename: filePath,
      height: imSize.height,
      width: imSize.width,
    };
  }

  async getImageFromConstellabDocument(project: CnProject, filePath: string): Promise<IncomingMessage> {
    const bucketConfig = await this.projectBucketService.getAndCheckProjectMainBucketConfig(project.getRootParentId());

    return this.objectStorageService.getObject(bucketConfig, filePath);
  }

  private generateDocumentFilePath(projectId: string, extension: string): string {
    return `${CnProjectBucketService.getPrefix('DOCUMENTS', projectId)}/${this.objectStorageService.generateRandomFileName(extension)}`;
  }

  /////////////////// TRASH ///////////////////
  public async moveToTrash(document: CnDocument): Promise<CnDocument> {
    document.inTrash = true;
    return await this.repo.save(document);
  }

  public async restoreFromTrash(document: CnDocument): Promise<CnDocument> {
    document.inTrash = false;
    return await this.repo.save(document);
  }
}
