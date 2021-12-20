import {Injectable, UnauthorizedException} from '@nestjs/common';
import {Experiment} from './experiment.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {AbstractWithStatusService} from '../core/class/abstract-with-status.service';
import {ExperimentStatus} from './experiment-status.enum';
import {ExperimentStatusHistory} from './experiment-status-history.entity';
import {LabExperimentDto} from './lab-experiment.dto';
import {CurrentUserHelper} from '../core/utils/current-user.helper';
import {Project} from '../projects/project.entity';

@Injectable()
export class ExperimentsService extends AbstractWithStatusService<Experiment, ExperimentStatus> {

  constructor(@InjectRepository(Experiment) private repository: Repository<Experiment>,
              @InjectRepository(ExperimentStatusHistory) statusHistoRepo: Repository<ExperimentStatusHistory>) {
    super(repository, Experiment, statusHistoRepo, ExperimentStatusHistory);
  }

  async create(experiment: Experiment): Promise<Experiment> {
    return this.createWithStatus(experiment, ExperimentStatus.DRAFT);
  }


  getExperimentsOfProject(projectId: string): Promise<Experiment[]> {
    return this.repository.find({
      where: {
        project: {id: projectId}
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  public async createLabExperiment(project: Project, labExperimentDto: LabExperimentDto): Promise<Experiment> {
    const experimentDB: Experiment = await this.findById(labExperimentDto.id, {relations: ['project']});

    if (experimentDB && experimentDB.project.id !== project.id) {
      throw new UnauthorizedException('Can\'t change the project of a validated experiment');
    }


    const newExperiment = new Experiment();
    newExperiment.id = labExperimentDto.id;
    newExperiment.project = project;
    newExperiment.title = labExperimentDto.data.title;
    newExperiment.description = labExperimentDto.data.description;
    newExperiment.createdAt = labExperimentDto.created_at;
    newExperiment.lastModifiedAt = labExperimentDto.last_modified_at;
    if (experimentDB) {
      // todo does not support status change
      return await this.updateWithCompare(newExperiment, experimentDB);
    } else {
      newExperiment.labInstance = CurrentUserHelper.getLabInstance();
      return this.createWithStatus(newExperiment, labExperimentDto.status);
    }
  }

}
