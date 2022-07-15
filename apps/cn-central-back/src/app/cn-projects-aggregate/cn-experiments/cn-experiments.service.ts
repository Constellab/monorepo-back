import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnExperiment} from './cn-experiment.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnCreateLabExperimentDto} from './cn-experiment.dto';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnLabConfigsService} from '../../cn-lab-configs/cn-lab-configs.service';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnUser} from '../../cn-users/cn-user.entity';

@Injectable()
export class CnExperimentsService extends BlAbstractService<CnExperiment> {

  constructor(@InjectRepository(CnExperiment) private repository: Repository<CnExperiment>,
              private labConfigService: CnLabConfigsService) {
    super(repository, CnExperiment);
  }

  getExperimentsByProject(projectId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: {
        projectId: projectId
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  getExperimentsByLabInstance(labInstanceId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: {
        labInstance: {id: labInstanceId}
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  public async createLabExperiment(project: CnProject, createLabExperimentDto: CnCreateLabExperimentDto): Promise<CnExperiment> {
    const experimentDB: CnExperiment = await this.findById(createLabExperimentDto.experiment.id);

    if (experimentDB && experimentDB.projectId !== project.id) {
      throw new UnauthorizedException('Can\'t change the project of a validated experiment');
    }

    const labConfig = await this.labConfigService.getOrCreateLabConfig(createLabExperimentDto.lab_config);

    const labExperimentDto = createLabExperimentDto.experiment;
    const experiment = new CnExperiment();
    experiment.id = labExperimentDto.id;
    experiment.projectId = project.id;
    experiment.title = labExperimentDto.title;
    experiment.description = labExperimentDto.description;
    experiment.createdAt = labExperimentDto.created_at;
    experiment.lastModifiedAt = labExperimentDto.last_modified_at;
    experiment.status = labExperimentDto.status;
    experiment.labConfig = labConfig;
    experiment.protocol = createLabExperimentDto.protocol;
    experiment.validatedAt = labExperimentDto.validated_at;

    if (labExperimentDto.validated_by) {
      const validatedBy = new CnUser();
      validatedBy.id = labExperimentDto.validated_by.id;
      experiment.validatedBy = validatedBy;
    }

    if (experimentDB) {
      return await this.updateWithCompare(experiment, experimentDB);
    } else {
      experiment.labInstance = CnCurrentUserHelper.getLabInstance();
      return this.create(experiment);
    }
  }

  findByIdAndCheckWithReports(id: string): Promise<CnExperiment> {
    return this.findByIdAndCheck(id, {relations: ['reports']});
  }

}
