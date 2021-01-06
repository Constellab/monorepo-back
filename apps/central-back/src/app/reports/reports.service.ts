import {Injectable} from '@nestjs/common';
import {AbstractService} from '../core/class/abstract.service';
import {Report} from './report.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class ReportsService extends AbstractService<Report> {

  constructor(@InjectRepository(Report) private repository: Repository<Report>) {
    super(repository, Report);
  }

  getReportsByExperiment(experimentId: string): Promise<Report[]> {
    return this.repository.find({
      where: {experiment: experimentId}
    });
  }
}
