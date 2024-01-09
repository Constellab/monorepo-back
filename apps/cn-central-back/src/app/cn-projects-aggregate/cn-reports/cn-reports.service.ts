import {Injectable, Logger} from '@nestjs/common';
import {CnReport} from './cn-report.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnExperiment} from '../cn-experiments/cn-experiment.entity';
import {
  BlAbstractService,
  BlBadRequestException,
  BlBucketConfig,
  BlFile,
  BlFileHelper,
  BlObjectStorageService
} from '@monorepo/back-core-lib';
import {IncomingMessage} from 'http';
import {CnCreateReportWithConfigDto, CnSaveReportDto, CnSaveReportResultDTO} from './cn-report.dto';
import {CnReportContent, CnReportViewConfig} from './cn-report-content.class';
import {CnLabConfigsService} from '../../cn-lab-configs/cn-lab-configs.service';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnProjectBucketService} from '../cn-projects/cn-project-bucket.service';

@Injectable()
export class CnReportsService extends BlAbstractService<CnReport> {
  protected readonly logger = new Logger(CnReportsService.name);

  constructor(@InjectRepository(CnReport) private repository: Repository<CnReport>,
              private objectStorageService: BlObjectStorageService,
              private labConfigService: CnLabConfigsService,
              private projectBucketService: CnProjectBucketService) {
    super(repository, CnReport);
  }

  getReportsByProject(projectId: string): Promise<CnReport[]> {
    return this.repository.find({
      where: {
        projectId: projectId
      },
      order: {lastModifiedAt: 'DESC' as any}
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

  async saveReport(createReportDto: CnCreateReportWithConfigDto, experiments: CnExperiment[],
                   project: CnProject, buckets: BlBucketConfig[], files: BlFile[]): Promise<CnSaveReportResultDTO> {

    const reportDb: CnReport = await this.findById(createReportDto.report.id);
    if (reportDb && reportDb.projectId !== project.id) {
      throw new BlBadRequestException('Can\'t change the project of a synced report');
    }

    // retrieve the lab config
    const labConfig = await this.labConfigService.getOrCreateLabConfig(createReportDto.lab_config);

    const reportDto: CnSaveReportDto = createReportDto.report;
    const richText = new CnReportContent(reportDto.content);

    const prefix = CnProjectBucketService.getPrefix(project, 'REPORT_CONTENTS', reportDto.id);

    if (files != null || createReportDto.resource_views != null) {
      await this.loadReportImages(richText, buckets, files, prefix);
      await this.loadReportViews(richText, buckets, createReportDto.resource_views, prefix);
    }

    const report = new CnReport();
    report.id = reportDto.id;
    report.createdAt = reportDto.created_at;
    report.createdBy = reportDto.created_by;
    report.lastModifiedAt = reportDto.last_modified_at;
    report.lastModifiedBy = reportDto.last_modified_by;
    report.title = reportDto.title;
    report.content = richText.getContent();
    report.project = project;
    report.experiments = experiments;
    report.labConfig = labConfig;

    // handle validated
    report.isValidated = reportDto.is_validated;
    report.validatedAt = reportDto.validated_at;
    report.validatedBy = reportDto.validated_by;

    // handle last_sync
    report.lastSyncAt = reportDto.last_sync_at;
    report.lastSyncBy = reportDto.last_sync_by;

    if (reportDb) {
      const rep = await this.updateWithCompare(report, reportDb);
      return {
        mode: 'update',
        report: rep
      };
    } else {
      report.labInstance = CnCurrentUserHelper.getCurrentLabInstance();
      const rep = await this.create(report);
      return {
        mode: 'create',
        report: rep
      };
    }
  }

  public async deleteReport(id: string): Promise<CnReport> {
    const report = await this.findById(id);

    // no error if report not found for more resilience
    if (!report) {
      return null;
    }

    if (report.isValidated) {
      throw new BlBadRequestException('Can\'t delete a validated report');
    }
    await this.deleteById(id);

    return report;
  }

  findByIdAndCheckWithExperiments(id: string): Promise<CnReport> {
    return this.findByIdAndCheck(id, {experiments: true});
  }

  async getImage(filename: string, project: CnProject, reportId: string): Promise<IncomingMessage> {
    const prefix = CnProjectBucketService.getPrefix(project, 'REPORT_CONTENTS', reportId);
    const filePath = `${prefix}/${filename}`;
    return await this.objectStorageService.getObject(await this.getBucketConfig(project.getRootParentId()), filePath);
  }

  async getView(filename: string, project: CnProject, reportId: string): Promise<IncomingMessage> {
    const prefix = CnProjectBucketService.getPrefix(project, 'REPORT_CONTENTS', reportId);
    const filePath = `${prefix}/${filename}`;
    return await this.objectStorageService.getObject(await this.getBucketConfig(project.getRootParentId()), filePath);
  }

  public async getCurrentUserVCreatedReport(): Promise<CnReport[]> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    return this.repository.find({
      where: {
        createdBy: {
          id: userInfo.userId
        },
        project: {
          spaceId: userInfo.spaceId
        }
      }
    });
  }


  /**
   * Methode to store the images of the report in the object storage
   */
  private async loadReportImages(richText: CnReportContent, buckets: BlBucketConfig[],
                                 files: BlFile[], prefix: string): Promise<void> {
    if (!files) return;
    for (const file of files) {
      const filename = this.objectStorageService.generateRandomFileName(file.originalname);
      await this.objectStorageService.uploadObject(buckets, file, {filename: filename, prefix: prefix});

      richText.updateFigure(file.originalname, {filename: filename});
    }
  }

  /**
   * Method to load the resource view of the report and store them in the object storage
   */
  private async loadReportViews(richText: CnReportContent, buckets: BlBucketConfig[],
                                resourceViews: Record<string, any>,
                                prefix: string): Promise<void> {

    for (const specialOp of richText.getViewsOps()) {
      const viewConfig: CnReportViewConfig = specialOp.insert.resource_view;

      const viewData = resourceViews[viewConfig.id];

      // upload the json
      const filePath = await this.objectStorageService.uploadJson(
        buckets, viewData, {prefix});

      // and save the filename in the content
      specialOp.insert.resource_view.filename = BlFileHelper.extractFilenameFromFullPath(filePath);
    }
  }

  private async getBucketConfig(projectId: string): Promise<BlBucketConfig> {
    return await this.projectBucketService.getAndCheckProjectMainBucketConfig(projectId);
  }

  public findAll(): Promise<CnReport[]> {
    return this.repository.find();
  }
}
