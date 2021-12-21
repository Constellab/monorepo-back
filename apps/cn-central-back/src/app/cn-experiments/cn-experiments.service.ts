import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnExperiment} from './cn-experiment.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnAbstractWithStatusService} from '../cn-core/class/cn-abstract-with-status.service';
import {CnExperimentStatus} from './cn-experiment-status.enum';
import {CnExperimentStatusHistory} from './cn-experiment-status-history.entity';
import {CnLabExperimentDto} from './cn-lab-experiment.dto';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnProject} from '../cn-projects/cn-project.entity';

@Injectable()
export class CnExperimentsService extends CnAbstractWithStatusService<CnExperiment, CnExperimentStatus> {

  constructor(@InjectRepository(CnExperiment) private repository: Repository<CnExperiment>,
              @InjectRepository(CnExperimentStatusHistory) statusHistoRepo: Repository<CnExperimentStatusHistory>) {
    super(repository, CnExperiment, statusHistoRepo, CnExperimentStatusHistory);
  }

  async create(experiment: CnExperiment): Promise<CnExperiment> {
    return this.createWithStatus(experiment, CnExperimentStatus.DRAFT);
  }


  getExperimentsOfProject(projectId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: {
        projectId: projectId
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  getExperimentOfLabInstance(labInstanceId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: {
        labInstance: {id: labInstanceId}
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  public async createLabExperiment(project: CnProject, labExperimentDto: CnLabExperimentDto): Promise<CnExperiment> {
    const experimentDB: CnExperiment = await this.findById(labExperimentDto.id);

    if (experimentDB && experimentDB.projectId !== project.id) {
      throw new UnauthorizedException('Can\'t change the project of a validated experiment');
    }

    const newExperiment = new CnExperiment();
    newExperiment.id = labExperimentDto.id;
    newExperiment.projectId = project.id;
    newExperiment.title = labExperimentDto.title;
    newExperiment.description = labExperimentDto.description;
    newExperiment.createdAt = labExperimentDto.created_at;
    newExperiment.lastModifiedAt = labExperimentDto.last_modified_at;
    if (experimentDB) {
      // todo does not support status change
      return await this.updateWithCompare(newExperiment, experimentDB);
    } else {
      newExperiment.labInstance = CnCurrentUserHelper.getLabInstance();
      return this.createWithStatus(newExperiment, labExperimentDto.status);
    }
  }

}
