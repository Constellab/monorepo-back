import {Injectable} from '@nestjs/common';
import {BlAbstractService, BlBadRequestException, BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnObjectStoragesAggregateService} from '../../cn-object-storages/cn-object-storages-aggregate.service';
import {IncomingMessage} from 'http';
import {CnDocument} from './cn-document.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';

@Injectable()
export class CnDocumentsService extends BlAbstractService<CnDocument> {
  private static readonly DOCUMENT_BUCKET_PREFIX = 'documents';

  constructor(@InjectRepository(CnDocument) private repository: Repository<CnDocument>,
              private objectStorageService: BlObjectStorageService,
              private objectStoragesAggregateService: CnObjectStoragesAggregateService,
              private datasource: DataSource) {
    super(repository, CnDocument);
  }

  public async uploadDocument(file: BlFile, project: CnProject): Promise<CnDocument> {
    const bucket = await this.objectStoragesAggregateService.getAndCheckProjectBucket(project.getRootParentId());
    const filename = `${CnDocumentsService.DOCUMENT_BUCKET_PREFIX}/${project.id}/${file.originalname}`;

    const existingDocument = await this.findDocumentByPath(filename);

    if (existingDocument) {
      throw new BlBadRequestException(CnErrorText.DOCUMENT_ALREADY_EXIST);
    }

    return this.datasource.transaction(async (entityManager) => {


      const document = new CnDocument();
      document.name = file.originalname;
      document.filePath = filename;
      document.project = project;
      document.size = file.size;
      document.mimeType = file.mimetype;

      const dbDocument = await entityManager.save(document);

      await this.objectStorageService.uploadObject(bucket.getBucketConfig(), file,
        {filename: filename});
      return dbDocument;
    });
  }

  public async getDocument(project: CnProject, filename: string): Promise<IncomingMessage> {
    const bucket = await this.objectStoragesAggregateService.getAndCheckProjectBucket(project.getRootParentId());

    return this.objectStorageService.getObject(bucket.getBucketConfig(), filename);
  }

  public async deleteDocument(id: string, project: CnProject): Promise<void> {
    const bucket = await this.objectStoragesAggregateService.getAndCheckProjectBucket(project.getRootParentId());

    const document = await this.findByIdAndCheck(id);

    return this.datasource.transaction(async (entityManager) => {
      await entityManager.remove(document);
      await this.objectStorageService.deleteObjectIfExist(bucket.getBucketConfig(), document.filePath);
    });
  }

  public getDocumentsByProject(projectId: string, page: number, size: number): Promise<ClPage<CnDocument>> {
    return this.findPaginated(page, size, {
      where: {
        project: {id: projectId}
      },
      order: {
        lastModifiedAt: 'DESC' as any
      }
    });
  }

  async findDocumentByPath(path: string): Promise<CnDocument> {
    return this.repo.findOne({where: {filePath: path}});
  }
}
