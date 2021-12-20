import {Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {Report} from './cn-report.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class CnReportsService extends CnAbstractService<Report> {

  constructor(@InjectRepository(Report) private repository: Repository<Report>) {
    super(repository, Report);
  }

  getReportsByExperiment(experimentId: string): Promise<Report[]> {
    return this.repository.find({
      where: {experiment: experimentId}
    });
  }
}
