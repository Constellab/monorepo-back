import {Injectable} from '@nestjs/common';
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
  BlObjectStorageService
} from '@monorepo/back-core-lib';
import {IncomingMessage} from 'http';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnCreateReportWithConfigDto, CnSaveReportDto} from './cn-report.dto';
import {CnExternalLabApiService} from '../../cn-external-lab-api/cn-external-lab-api.service';
import {AxiosResponse} from 'axios';
import {CnReportContent, CnReportViewConfig} from './cn-report-content.class';
import {CnLabConfigsService} from '../../cn-lab-configs/cn-lab-configs.service';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnObjectStoragesAggregateService} from '../../cn-object-storages/cn-object-storages-aggregate.service';

@Injectable()
export class CnReportsService extends BlAbstractService<CnReport> {

  private static readonly REPORT_BUCKET_PREFIX = 'reports';

  constructor(@InjectRepository(CnReport) private repository: Repository<CnReport>,
              private objectStorageService: BlObjectStorageService,
              private configService: CnCoreConfigService,
              private externalLabService: CnExternalLabApiService,
              private labConfigService: CnLabConfigsService,
              private objectStorageAggregatorService: CnObjectStoragesAggregateService) {
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

  async createReport(createReportDto: CnCreateReportWithConfigDto, experiments: CnExperiment[],
                     project: CnProject, bucket: BlBucketConfig, files: BlFile[]): Promise<CnReport> {

    const reportDb: CnReport = await this.findById(createReportDto.report.id);
    if (reportDb && reportDb.projectId !== project.id) {
      throw new BlBadRequestException('Can\'t change the project of a synced report');
    }

    // retrieve the lab config
    const labConfig = await this.labConfigService.getOrCreateLabConfig(createReportDto.lab_config);

    const reportDto: CnSaveReportDto = createReportDto.report;
    const richText = new CnReportContent(reportDto.content);

    const prefix = `${CnReportsService.REPORT_BUCKET_PREFIX}/${reportDto.id}/`;

    // use v2
    if (files != null && createReportDto.resource_views != null) {
      await this.loadReportImagesV2(richText, bucket, files, prefix);
      await this.loadReportViewsV2(richText, bucket, createReportDto.resource_views, prefix);
    } else {
      // upload view and images
      await this.loadReportImages(richText, bucket, prefix);

      await this.loadReportViews(richText, bucket, prefix);

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
      return await this.updateWithCompare(report, reportDb);
    } else {
      report.labInstance = CnCurrentUserHelper.getCurrentLabInstance();
      return this.create(report);
    }
  }

  public async deleteReport(id: string): Promise<void> {
    const report = await this.findById(id);

    // no error if report not found for more resilience
    if (!report) {
      return;
    }

    if (report.isValidated) {
      throw new BlBadRequestException('Can\'t delete a validated report');
    }
    await this.deleteById(id);
  }

  findByIdAndCheckWithExperiments(id: string): Promise<CnReport> {
    return this.findByIdAndCheck(id, {experiments: true});
  }

  async getImage(filename: string, projectId: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(await this.getBucketConfig(projectId), filename);
  }

  async getView(filename: string, projectId: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(await this.getBucketConfig(projectId), filename);
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
   * Method to load the image of the report and store them in the object storage
   */
  private async loadReportImages(richText: CnReportContent, bucket: BlBucketConfig,
                                 prefix: string): Promise<void> {
    for (const figureOp of richText.getFiguresOps()) {

      const figure = figureOp.insert.figure;
      const result: AxiosResponse = await this.externalLabService.getReportImage(
        CnCurrentUserHelper.getAndCheckCurrentLabInstance().getGlabApiInfo(), figure.filename);

      // Upload the image to the object storage and update the figure filename
      figureOp.insert.figure.filename = await this.objectStorageService.uploadIncomingMessage(
        bucket, result.data,
        prefix + figure.filename, result.headers['content-type']);
    }
  }

  /**
   * Methode to store the images of the report in the object storage
   */
  private async loadReportImagesV2(richText: CnReportContent, bucket: BlBucketConfig,
                                   files: BlFile[], prefix: string): Promise<void> {
    for (const file of files) {
      let filename = prefix + file.originalname;
      filename = await this.objectStorageService.uploadObject(bucket, file, {filename: filename});

      richText.updateFigure(file.originalname, {filename: filename});
    }
  }

  /**
   * Method to load the resource view of the report and store them in the object storage
   */
  private async loadReportViews(richText: CnReportContent, bucket: BlBucketConfig,
                                prefix: string): Promise<void> {

    for (const specialOp of richText.getViewsOps()) {
      const viewConfig: CnReportViewConfig = specialOp.insert.resource_view;

      const view = await this.externalLabService.callResourceView(
        CnCurrentUserHelper.getAndCheckCurrentLabInstance().getGlabApiInfo(),
        viewConfig.resource_id,
        viewConfig.view_method_name,
        {values: viewConfig.view_config, transformers: viewConfig.transformers, save_view_config: false});

      // save the filename in the content
      specialOp.insert.resource_view.filename = await this.objectStorageService.uploadJson(
        bucket, view, {prefix});
    }
  }

  /**
   * Method to load the resource view of the report and store them in the object storage
   */
  private async loadReportViewsV2(richText: CnReportContent, bucket: BlBucketConfig,
                                  resourceViews: Record<string, any>,
                                  prefix: string): Promise<void> {

    for (const specialOp of richText.getViewsOps()) {
      const viewConfig: CnReportViewConfig = specialOp.insert.resource_view;

      const viewData = resourceViews[viewConfig.id];

      // upload the json and save the filename in the content
      specialOp.insert.resource_view.filename = await this.objectStorageService.uploadJson(
        bucket, viewData, {prefix});
    }
  }

  private async getBucketConfig(projectId: string): Promise<BlBucketConfig> {
    const bucket = await this.objectStorageAggregatorService.getAndCheckProjectBucket(projectId);
    return bucket.getBucketConfig();
  }
}
