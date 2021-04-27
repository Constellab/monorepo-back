import {Injectable} from '@nestjs/common';
import {Experiment} from './experiment.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {AbstractWithStatusService} from '../core/class/abstract-with-status.service';
import {ExperimentStatus} from './experiment-status.enum';
import {ExperimentStatusHistory} from './experiment-status-history.entity';

@Injectable()
export class ExperimentsService extends AbstractWithStatusService<Experiment, ExperimentStatus> {

  constructor(@InjectRepository(Experiment) private repository: Repository<Experiment>,
              @InjectRepository(ExperimentStatusHistory) statusHistoRepo: Repository<ExperimentStatusHistory>) {
    super(repository, Experiment, statusHistoRepo, ExperimentStatusHistory);
  }

  async create(experiment: Experiment): Promise<Experiment> {
    return this.createWithStatus(experiment, ExperimentStatus.DRAFT);
  }


  getExperimentsOfStudy(studyId: string): Promise<Experiment[]> {
    return this.repository.find({
      where: {
        study: {id: studyId}
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }
}
