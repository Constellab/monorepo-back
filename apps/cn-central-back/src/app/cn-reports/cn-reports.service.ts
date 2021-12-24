import {BadRequestException, Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnReport} from './cn-report.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnCreateReportDto} from './cn-create-report.dto';
import {CnExperimentsService} from '../cn-experiments/cn-experiments.service';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnExperiment} from '../cn-experiments/cn-experiment.entity';

@Injectable()
export class CnReportsService extends CnAbstractService<CnReport> {

  constructor(@InjectRepository(CnReport) private repository: Repository<CnReport>,
              private experimentService: CnExperimentsService) {
    super(repository, CnReport);
  }

  async getReportsByExperiment(experimentId: string): Promise<CnReport[]> {
    return await this.repository.createQueryBuilder('report')
      .innerJoin('report_experiment', 'report_experiment',
        'report_experiment.reportId = report.id and report_experiment.experimentId = :myId', {myId: experimentId})
      .getMany();
  }

  async createReport(reportDTO: CnCreateReportDto, project: CnProject): Promise<CnReport> {
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
}
