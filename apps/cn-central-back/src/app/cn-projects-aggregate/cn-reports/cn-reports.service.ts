import {Injectable} from '@nestjs/common';
import {CnReport} from './cn-report.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnExperiment} from '../cn-experiments/cn-experiment.entity';
import {BlAbstractService, BlObjectStorageService} from '@monorepo/back-core-lib';
import {IncomingMessage} from 'http';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnCreateReportDto} from './cn-report.dto';
import {CnExternalLabApiService} from '../../cn-external-lab-api/cn-external-lab-api.service';
import {AxiosResponse} from 'axios';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnReportContent, CnReportViewConfig} from './cn-report-content.class';

@Injectable()
export class CnReportsService extends BlAbstractService<CnReport> {

  constructor(@InjectRepository(CnReport) private repository: Repository<CnReport>,
              private objectStorageService: BlObjectStorageService,
              private configService: CnCoreConfigService,
              private externalLabService: CnExternalLabApiService) {
    super(repository, CnReport);
  }

  getReportsByProject(projectId: string): Promise<CnReport[]> {
    return this.repository.find({
      where: {
        projectId: projectId
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  async createReport(createReportDto: CnCreateReportDto, experiments: CnExperiment[],
                     project: CnProject): Promise<CnReport> {

    const richText = new CnReportContent(createReportDto.content);

    await this.loadReportImages(richText);

    await this.loadReportViews(richText);

    const report = new CnReport();
    report.id = createReportDto.id;
    report.createdAt = createReportDto.createdAt;
    report.createdBy = createReportDto.createdBy;
    report.lastModifiedAt = createReportDto.lastModifiedAt;
    report.lastModifiedBy = createReportDto.lastModifiedBy;
    report.title = createReportDto.title;
    report.content = richText.getContent();
    report.project = project;
    report.experiments = experiments;

    return await this.repository.save(report);
  }

  /**
   * Method to load the image of the report and store them in the object storage
   * @param richText
   * @private
   */
  private async loadReportImages(richText: CnReportContent): Promise<void> {
    for (const figureOp of richText.getFiguresOps()) {

      const figure = figureOp.insert.figure;
      const result: AxiosResponse = await this.externalLabService.getReportImage(
        CnCurrentUserHelper.getAndCheckCurrentLabInstance().getGlabApiInfo(), figure.filename);

      // Upload the image to the object storage and update the figure filename
      figureOp.insert.figure.filename = await this.objectStorageService.uploadIncomingMessage(
        result.data, this.configService.getReportImageObjectStorageBucket(),
        figure.filename, result.headers['content-type'])
    }
  }

  /**
   * Method to load the resource view of the report and store them in the object storage
   * @param richText
   * @private
   */
  private async loadReportViews(richText: CnReportContent): Promise<void> {

    for (const specialOp of richText.getViewsOps()) {
      const viewConfig: CnReportViewConfig = specialOp.insert.resource_view;

      const view = await this.externalLabService.callResourceView(
        CnCurrentUserHelper.getAndCheckCurrentLabInstance().getGlabApiInfo(),
        viewConfig.resource_id,
        viewConfig.view_method_name,
        {values: viewConfig.view_config, transformers: viewConfig.transformers, save_view_config: false});

      // save the filename in the content
      specialOp.insert.resource_view.filename = await this.objectStorageService.uploadJson(view, this.getReportViewBucket());
    }
  }

  findByIdAndCheckWithExperiments(id: string): Promise<CnReport> {
    return this.findByIdAndCheck(id, {relations: ['experiments']});
  }

  async getImage(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(filename, this.getReportImageBucket());
  }

  async getView(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(filename, this.getReportViewBucket());
  }

  private getReportImageBucket(): string {
    return this.configService.getReportImageObjectStorageBucket();
  }

  private getReportViewBucket(): string {
    return this.configService.getReportViewObjectStorageBucket();
  }
}
