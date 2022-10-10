import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {CnExperiment} from './cn-experiment.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
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

  public async saveLabExperiment(project: CnProject, createLabExperimentDto: CnCreateLabExperimentDto): Promise<CnExperiment> {
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
    experiment.status = labExperimentDto.status;
    experiment.labConfig = labConfig;
    experiment.protocol = createLabExperimentDto.protocol;

    experiment.createdBy = labExperimentDto.createdBy;
    experiment.createdAt = labExperimentDto.createdAt;

    experiment.lastModifiedBy = labExperimentDto.lastModifiedBy;
    experiment.lastModifiedAt = labExperimentDto.lastModifiedAt;

    // handle validated
    experiment.isValidated = labExperimentDto.is_validated;
    experiment.validatedAt = labExperimentDto.validated_at;
    if (labExperimentDto.validated_by) {
      const validatedBy = new CnUser();
      validatedBy.id = labExperimentDto.validated_by.id;
      experiment.validatedBy = validatedBy;
    }

    // handle last_sync
    experiment.lastSyncAt = labExperimentDto.last_sync_at;
    if (labExperimentDto.last_sync_by) {
      const lastSyncBy = new CnUser();
      lastSyncBy.id = labExperimentDto.last_sync_by.id;
      experiment.lastSyncBy = lastSyncBy;
    }

    if (experimentDB) {
      return await this.updateWithCompare(experiment, experimentDB);
    } else {
      experiment.labInstance = CnCurrentUserHelper.getLabInstance();
      return this.create(experiment);
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
    return this.findByIdAndCheck(id, {relations: ['reports']});
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
        lastModifiedAt: 'DESC'
      },
      relations: ['project']
    });
  }

  //Get user last 3 experiments
  public async getCurrentUserLastExperiments(): Promise<CnExperiment[]> {
    return (await this.getCurrentUserValidatedExperiment()).slice(0, 3);
  }

  public async getExperimentLabConfig(experimentId: string): Promise<CnLabConfig> {
    const labConf: CnLabConfig = (await this.repository.findOne(experimentId, {relations: ['labConfig']})).labConfig;
    return this.labConfigService.findByIdAndCheck(labConf.id, {relations: ['brickVersions']});
  }
}
