import {BadRequestException, forwardRef, Inject, Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnReport} from './cn-report.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnCreateReportDto} from './cn-report.dto';
import {CnExperimentsService} from '../cn-experiments/cn-experiments.service';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnExperiment} from '../cn-experiments/cn-experiment.entity';
import {BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {CmRichText} from '@monorepo/common-model';

@Injectable()
export class CnReportsService extends CnAbstractService<CnReport> {

  private readonly reportBucket: string = 'constellab-pre-prod';

  constructor(@InjectRepository(CnReport) private repository: Repository<CnReport>,
              @Inject(forwardRef(() => CnExperimentsService)) private experimentService: CnExperimentsService,
              private objectStorageService: BlObjectStorageService) {
    super(repository, CnReport);
  }


  async getReportsByExperiment(experimentId: string): Promise<CnReport[]> {
    return (await this.experimentService.findByIdAndCheckWithReports(experimentId)).reports;
  }

  getReportsByProject(projectId: string): Promise<CnReport[]> {
    return this.repository.find({
      where: {
        projectId: projectId
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  async createReport(reportDTO: CnCreateReportDto, project: CnProject, files: BlFile[]): Promise<CnReport> {
    // get and check all experiment
    const experiments: CnExperiment[] = [];
    for (const experimentId of reportDTO.experimentIds) {
      const experiment: CnExperiment = await this.experimentService.findById(experimentId);

      if (experiment == null) {
        throw new BadRequestException('Can\'t create the report because one of the linked experiment could not be found');
      }

      if (experiment.projectId !== project.id) {
        throw new BadRequestException('Can\'t create the report because it is linked to an experiment of another project');
      }
      experiments.push(experiment);
    }

    const quillJson = new CmRichText(reportDTO.content);
    for (const file of files) {
      const filename = await this.objectStorageService.uploadObject(file, this.reportBucket);

      quillJson.updateFigure(file.originalname, {filename: filename, url: ''});
    }


    const report = new CnReport();
    report.id = reportDTO.id;
    report.createdAt = reportDTO.createdAt;
    report.createdBy = reportDTO.createdBy;
    report.lastModifiedAt = reportDTO.lastModifiedAt;
    report.lastModifiedBy = reportDTO.lastModifiedBy;
    report.title = reportDTO.title;
    report.content = reportDTO.content;
    report.project = project;
    report.experiments = experiments;

    return await this.repository.save(report);
  }

  findByIdAndCheckWithExperiments(id: string): Promise<CnReport> {
    return this.findByIdAndCheck(id, {relations: ['experiments']});
  }
}
