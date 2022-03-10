import {Injectable} from '@nestjs/common';
import {CnReport} from './cn-report.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnExperiment} from '../cn-experiments/cn-experiment.entity';
import {BlAbstractService, BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {CmRichText} from '@monorepo/common-model';
import {IncomingMessage} from 'http';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnCreateReportDto} from './cn-report.dto';

@Injectable()
export class CnReportsService extends BlAbstractService<CnReport> {

  constructor(@InjectRepository(CnReport) private repository: Repository<CnReport>,
              private objectStorageService: BlObjectStorageService,
              private configService: CnCoreConfigService) {
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
                     project: CnProject, files: BlFile[]): Promise<CnReport> {

    const quillJson = new CmRichText(createReportDto.content);
    for (const file of files) {
      const filename = await this.objectStorageService.uploadObject(file, this.getReportBucket());

      quillJson.updateFigure(file.originalname, {filename: filename});
    }

    const report = new CnReport();
    report.id = createReportDto.id;
    report.createdAt = createReportDto.createdAt;
    report.createdBy = createReportDto.createdBy;
    report.lastModifiedAt = createReportDto.lastModifiedAt;
    report.lastModifiedBy = createReportDto.lastModifiedBy;
    report.title = createReportDto.title;
    report.content = quillJson.getContent();
    report.project = project;
    report.experiments = experiments;

    return await this.repository.save(report);
  }

  findByIdAndCheckWithExperiments(id: string): Promise<CnReport> {
    return this.findByIdAndCheck(id, {relations: ['experiments']});
  }

  async getImage(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(filename, this.getReportBucket());
  }

  private getReportBucket(): string {
    return this.configService.getReportObjectStorageBucket();
  }
}
