import { Injectable, Logger } from '@nestjs/common';
import { CnReport } from './cn-report.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CnExperiment } from '../cn-experiments/cn-experiment.entity';
import {
  BlAbstractService,
  BlBadRequestException,
  BlFile,
  BlFileResponse,
  BlQuillMigrator,
  BlRichTextContent
} from '@monorepo/back-core-lib';
import { CnCreateReportWithConfigDto, CnSaveReportDto, CnSaveReportResultDTO } from './cn-report.dto';
import { CnReportContent } from './cn-report-content.class';
import { CnLabConfigsService } from '../../cn-lab-configs/cn-lab-configs.service';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnProjectDocumentService } from '../cn-project-documents/cn-project-document.service';
import { CnProjectDocument, CnProjectDocumentType } from '../cn-project-documents/cn-project-document.entity';
import {
  CnFolderHierarchy,
  CnFolderHierarchyEntity,
  CnFolderObjectType
} from '../cn-folder-hierarchies/cn-folder-hierarchy.entity';

@Injectable()
export class CnReportsService extends BlAbstractService<CnReport> {
  protected readonly logger = new Logger(CnReportsService.name);

  constructor(@InjectRepository(CnReport) private repository: Repository<CnReport>,
              private labConfigService: CnLabConfigsService,
              private projectDocumentService: CnProjectDocumentService,
              private datasource: DataSource) {
    super(repository, CnReport);
  }

  getReportsByFolder(folderId: string): Promise<CnReport[]> {
    return this.repository.find({
      where: {
        id: folderId
      },
      order: { lastModifiedAt: 'DESC' as any }
    });
  }

  getReportsByLabInstance(labInstanceId: string): Promise<CnReport[]> {
    return this.repository.find({
      where: {
        labInstance: {
          id: labInstanceId
        }
      }
    });
  }

  getReportsByRootFolderAndLabInstance(rootFolderId: string, labInstanceId: string): Promise<CnReport[]> {
    return this.repository.find({
      where: [
        // find by folder parent root id (if report is link to leaf folder)
        {
          folderHierarchy: {
            rootParentId: rootFolderId
          },
          labInstance: {
            id: labInstanceId
          }
        },
        // find by folder (if report is linked to root folder)
        {
          folderHierarchy: {
            parentId: rootFolderId
          },
          labInstance: {
            id: labInstanceId
          }
        }
      ]
    });
  }

  public async getReportContent(parentFolder: CnFolderHierarchy, id: string): Promise<BlRichTextContent> {
    const report = await this.findByIdAndCheck(id, { document: true });
    return this.projectDocumentService.getJSONDocumentContent(parentFolder, report.document);
  }

  async getFile(filename: string, parentFolder: CnFolderHierarchy, reportId: string): Promise<BlFileResponse> {
    return await this.projectDocumentService.getDocumentContentByTypeAndName(parentFolder,
      CnProjectDocumentType.REPORT_CONTENT, filename, reportId);
  }

  async getView(viewId: string, parentFolder: CnFolderHierarchy, reportId: string): Promise<BlFileResponse> {
    return await this.projectDocumentService.getDocumentContentByTypeAndName(parentFolder,
      CnProjectDocumentType.REPORT_CONTENT, viewId + '.json', reportId);
  }


  async saveReport(createReportDto: CnCreateReportWithConfigDto, experiments: CnExperiment[],
                   parentFolder: CnFolderHierarchy, files: BlFile[]): Promise<CnSaveReportResultDTO> {

    let reportDb: CnReport = await this.findById(createReportDto.report.id, { document: true, folderHierarchy: true });
    if (reportDb && reportDb.folderHierarchy.parentId !== parentFolder.id) {
      throw new BlBadRequestException('Can\'t change the folder of a synced report');
    }

    // retrieve the lab config
    const labConfig = await this.labConfigService.getOrCreateLabConfig(createReportDto.lab_config);

    // copy fields of the report DTO to report
    const reportDto: CnSaveReportDto = createReportDto.report;
    const report = new CnReport();

    // if this is a creation
    if (!reportDb) {
      report.folderHierarchy = CnFolderHierarchyEntity.newSubFolderHierarchyEntity(
        CnFolderObjectType.REPORT, reportDto.title, reportDto.last_modified_by,
        reportDto.last_modified_at, parentFolder
      );
      // also set the id of the folder hierarchy because it should be the same as the report id
      report.folderHierarchy.id = reportDto.id;
    }

    report.id = reportDto.id;
    report.createdAt = reportDto.created_at;
    report.createdBy = reportDto.created_by;
    report.lastModifiedAt = reportDto.last_modified_at;
    report.lastModifiedBy = reportDto.last_modified_by;
    report.title = reportDto.title;

    report.experiments = experiments;
    report.labConfig = labConfig;

    // handle validated
    report.isValidated = reportDto.is_validated;
    report.validatedAt = reportDto.validated_at;
    report.validatedBy = reportDto.validated_by;

    // handle last_sync
    report.lastSyncAt = reportDto.last_sync_at;
    report.lastSyncBy = reportDto.last_sync_by;

    let mode: 'create' | 'update';
    if (reportDb) {
      reportDb = await this.updateWithCompare(report, reportDb);
      mode = 'update';
    } else {
      report.labInstance = CnCurrentUserHelper.getCurrentLabInstance();
      reportDb = await this.create(report);
      mode = 'create';
    }

    // update the content of the report
    reportDb = await this.saveReportContent(reportDb, parentFolder, createReportDto, files);
    return {
      mode: mode,
      report: reportDb
    };
  }

  /**
   * Method to store the report content in the object storage. Then manage the images and the views
   */
  private async saveReportContent(report: CnReport, parentFolder: CnFolderHierarchy,
                                  createReportDto: CnCreateReportWithConfigDto, files: BlFile[]): Promise<CnReport> {
    const content = BlQuillMigrator.migrateOptional(createReportDto.report.content);
    const richText = new CnReportContent(content);

    let reportDocument: CnProjectDocument;
    // if the document already exists, we update it
    if (report.document) {
      reportDocument = await this.projectDocumentService.updateJSONDocument(parentFolder, report.document,
        richText.getContent());
    } else {
      // or use the id as doc Name
      reportDocument = await this.projectDocumentService.createJSONDocument(parentFolder,
        CnProjectDocumentType.REPORT, report.title, report.id, richText.getContent());
    }

    // store document reference in the report
    report.document = reportDocument;
    report = await this.updatePartial(report.id, { document: reportDocument });

    // manage the file and image of the report
    await this.uploadReportFiles(files, report.id, reportDocument, parentFolder);
    // manage views of the report
    await this.uploadReportViews(richText, createReportDto.resource_views, report.id, reportDocument, parentFolder);

    return report;
  }

  /**
   * Methode to store the images of the report in the object storage
   */
  private async uploadReportFiles(files: BlFile[], reportId: string, parentDocument: CnProjectDocument,
                                  parentFolder: CnFolderHierarchy): Promise<void> {
    if (!files) return;
    for (const file of files) {
      await this.uploadReportFile(file, reportId, parentDocument, parentFolder);
    }
  }

  private async uploadReportFile(file: BlFile, reportId: string, parentDocument: CnProjectDocument,
                                 parentFolder: CnFolderHierarchy): Promise<void> {
    const filename = file.originalname;
    const document =
      await this.projectDocumentService.findDocumentByParentFolderAndTypeAndName(parentFolder.id, CnProjectDocumentType.REPORT_CONTENT,
        filename, reportId);

    // upload the image only if it does not exist
    if (!document) {
      await this.projectDocumentService.uploadDocument(file, parentFolder, CnProjectDocumentType.REPORT_CONTENT,
        reportId, filename, parentDocument);
    }
  }

  /**
   * Method to load the resource view of the report and store them in the object storage
   */
  private async uploadReportViews(richText: CnReportContent,
                                  resourceViews: Record<string, any>,
                                  reportId: string,
                                  parentDocument: CnProjectDocument,
                                  parentFolder: CnFolderHierarchy): Promise<void> {
    if (!resourceViews) return;

    const views = [...richText.getResourceViewsBlocks(), ...richText.getFileViewsBlocks()];
    for (const specialOp of views) {
      const viewBlockData = specialOp.data;

      const viewData = resourceViews[viewBlockData.id];

      if (!viewData) continue;

      const docName = `${viewBlockData.id}.json`;
      await this.projectDocumentService.createOrUpdateJSONDocument(parentFolder, CnProjectDocumentType.REPORT_CONTENT,
        docName, reportId, viewData, parentDocument);
    }
  }

  public async deleteReport(id: string, entityManager: EntityManager): Promise<CnReport> {
    const report = await this.findById(id, { document: true });

    // no error if report not found for more resilience
    if (!report) {
      return null;
    }

    if (report.isValidated) {
      throw new BlBadRequestException('Can\'t delete a validated report');
    }

    await this.deleteById(id, entityManager);

    if (report.document) {
      await this.projectDocumentService.deleteDocument(report.document.id, entityManager);
    }

    return report;
  }

  findByIdAndCheckWithExperiments(id: string): Promise<CnReport> {
    return this.findByIdAndCheck(id, { experiments: true });
  }

  /**
   * Get all the reports created by the current user
   */
  public async getCurrentUserCreatedReport(): Promise<CnReport[]> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    return this.repository.find({
      where: {
        createdBy: {
          id: userInfo.userId
        },
        folderHierarchy: {
          spaceId: userInfo.spaceId
        }
      }
    });
  }
}
