import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {CnExperiment} from './cn-experiment.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {CnCreateLabExperimentDto} from './cn-experiment.dto';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnLabConfigsService} from '../../cn-lab-configs/cn-lab-configs.service';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnUsersService} from '../../cn-users/cn-users.service';
import {CnLabConfig} from '../../cn-lab-configs/cn-lab-config.entity';

@Injectable()
export class CnExperimentsService extends BlAbstractService<CnExperiment> {

  constructor(@InjectRepository(CnExperiment) private repository: Repository<CnExperiment>,
              private labConfigService: CnLabConfigsService,
              private userService: CnUsersService) {
    super(repository, CnExperiment);
  }

  getExperimentsByProject(projectId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: {
        projectId: projectId
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }

  getExperimentsByLabInstance(labInstanceId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: {
        labInstance: {id: labInstanceId}
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }

  public async saveLabExperiment(project: CnProject, createLabExperimentDto: CnCreateLabExperimentDto,
                                 entityManager: EntityManager): Promise<CnExperiment> {

    const experimentDB: CnExperiment = await this.findById(createLabExperimentDto.experiment.id);
    if (experimentDB && experimentDB.projectId !== project.id) {
      throw new UnauthorizedException('Can\'t change the project of a synced experiment');
    }

    const labConfig = await this.labConfigService.getOrCreateLabConfig(createLabExperimentDto.lab_config);

    const labExperimentDto = createLabExperimentDto.experiment;
    const experiment = new CnExperiment();
    experiment.id = labExperimentDto.id;
    experiment.projectId = project.id;
    experiment.title = labExperimentDto.title;
    experiment.description = labExperimentDto.description;
    experiment.status = labExperimentDto.status;
    experiment.labConfig = labConfig;
    experiment.protocol = createLabExperimentDto.protocol;

    experiment.createdBy = labExperimentDto.created_by;
    experiment.createdAt = labExperimentDto.created_at;

    experiment.lastModifiedBy = labExperimentDto.last_modified_by;
    experiment.lastModifiedAt = labExperimentDto.last_modified_at;

    // handle validated
    experiment.isValidated = labExperimentDto.is_validated;
    experiment.validatedAt = labExperimentDto.validated_at;
    experiment.validatedBy = labExperimentDto.validated_by;

    // handle last_sync
    experiment.lastSyncAt = labExperimentDto.last_sync_at;
    experiment.lastSyncBy = labExperimentDto.last_sync_by;

    if (experimentDB) {
      return await this.updateWithCompare(experiment, experimentDB, entityManager);
    } else {
      experiment.labInstance = CnCurrentUserHelper.getCurrentLabInstance();
      return this.create(experiment, entityManager);
    }
  }

  public async deleteExperiment(id: string): Promise<void> {
    const experiment = await this.findById(id);

    // no error if experiment not found for more resilience
    if (!experiment) {
      return;
    }

    if (experiment.isValidated) {
      throw new BadRequestException('Can\'t delete a validated experiment');
    }
    await this.deleteById(id);
  }

  findByIdAndCheckWithReports(id: string): Promise<CnExperiment> {
    return this.findByIdAndCheck(id, {reports: true});
  }


  public async getCurrentUserValidatedExperiment(): Promise<CnExperiment[]> {
    const currentUser: CnUser = this.userService.getCurrent();
    return await this.repository.find({
      where: {
        validatedBy: {
          id: currentUser.id
        }
      },
      order: {
        lastModifiedAt: 'DESC' as any
      },
      relations: ['project'],

    });
  }

  //Get user last 3 experiments
  public async getCurrentUserLastExperiments(): Promise<CnExperiment[]> {
    return (await this.getCurrentUserValidatedExperiment()).slice(0, 3);
  }

  public async getExperimentLabConfig(experimentId: string): Promise<CnLabConfig> {
    return (await this.repository.findOne({
      where: {id: experimentId},
      relations: {labConfig: {brickVersions: true}},
    })).labConfig;
  }
}
