import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnLabInstance} from './cn-lab-instance.entity';
import {DataSource, DeleteResult, EntityManager, Repository} from 'typeorm';
import {CnLabInstanceStatus} from './cn-lab-instance-status.enum';
import {CnAbstractWithStatusService} from '../cn-core/class/cn-abstract-with-status.service';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnExperiment} from '../cn-projects-aggregate/cn-experiments/cn-experiment.entity';
import {CnExperimentsService} from '../cn-projects-aggregate/cn-experiments/cn-experiments.service';
import {CnLabInstanceStartDTO} from './cn-lab-instance.dto';
import {CnLabConfigsService} from '../cn-lab-configs/cn-lab-configs.service';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnUserOrgaInfo} from '../cn-users/cn-user.dto';
import {CnReportsService} from '../cn-projects-aggregate/cn-reports/cn-reports.service';

@Injectable()
export class CnLabInstancesService extends CnAbstractWithStatusService<CnLabInstance, CnLabInstanceStatus> {

  constructor(@InjectRepository(CnLabInstance) private repository: Repository<CnLabInstance>,
              @InjectRepository(CnLabInstanceStatusHistory) statusHistoRepo: Repository<CnLabInstanceStatusHistory>,
              private experimentService: CnExperimentsService,
              private reportService: CnReportsService,
              private labConfigService: CnLabConfigsService,
              datasource: DataSource) {
    super(repository, CnLabInstance, statusHistoRepo, CnLabInstanceStatusHistory, datasource);
  }


  async create(entity: CnLabInstance): Promise<CnLabInstance> {
    return super.createWithStatus(entity, CnLabInstanceStatus.STOPPED);
  }

  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const experiments: CnExperiment[] = await this.experimentService.getExperimentsByLabInstance(id);
    if (experiments?.length > 0) {
      throw new BadRequestException('Can\'t delete the lab instance because some experiment are linked to it');
    }

    const reports = await this.reportService.getReportsByLabInstance(id);
    if (reports?.length > 0) {
      throw new BadRequestException('Can\'t delete the lab instance because some reports are linked to it');
    }

    return super.deleteById(id, entityManager);
  }

  public async getCurrentLabInstances(page: number, size: number): Promise<ClPageI<CnLabInstance>> {
    const userInfo: CnUserOrgaInfo = CnCurrentUserHelper.getAndCheckUserOrgaInfo();

    return this.findPaginated(page, size, {
      where: {
        sharedGroups: {
          userId: userInfo.userId
        },
        organizationId: userInfo.organizationId
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }

  public async getCurrentRunningLabInstances(): Promise<CnLabInstance[]> {
    const userInfo: CnUserOrgaInfo = CnCurrentUserHelper.getAndCheckUserOrgaInfo();

    return this.repository.find({
      where: {
        sharedGroups: {
          userId: userInfo.userId
        },
        currentStatus: {
          status: CnLabInstanceStatus.RUNNING
        }
      },
      relations: ['currentStatus'],
      order: {
        lastModifiedAt: 'DESC' as any
      }
    });
  }

  public startInstance(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatus(CnLabInstanceStatus.RUNNING, id);
  }

  public stopInstance(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatus(CnLabInstanceStatus.STOPPED, id);
  }


  public findLabByApiKey(apiKey: string): Promise<CnLabInstance> {
    return this.repository.findOne({
      where: {
        glabApiKey: apiKey
      }
    });
  }


  public async findAll(): Promise<CnLabInstance[]> {
    return await this.repository.find(
      {
        relations: {organization: true},
        order: {lastModifiedAt: 'DESC' as any},
      },
    );
  }


  public async updateName(labInstanceId: string, name: string): Promise<CnLabInstance> {
    const lab: CnLabInstance = await this.findByIdAndCheck(labInstanceId);
    lab.name = name;
    return this.repository.save(lab);
  }


  /**
   * Called by the lab to tell central it has started
   */
  public async onStart(labStart: CnLabInstanceStartDTO): Promise<void> {
    const labConfig = await this.labConfigService.getOrCreateLabConfig(labStart.lab_config);

    const labInstance = CnCurrentUserHelper.getAndCheckCurrentLabInstance();

    labInstance.labConfig = labConfig;
    await this.update(labInstance);
    // await this.startInstance(labInstance.id)
  }

  public async getLabConfig(labInstanceId: string): Promise<CnLabConfig> {
    const labInstance = await this.findByIdAndCheck(labInstanceId, {
      labConfig: {brickVersions: {brick: true}}
    });
    return labInstance.labConfig;
  }

  public async findByOrganization(organizationId: string, page: number, size: number): Promise<ClPage<CnLabInstance>> {
    return this.findPaginated(page, size, {
      where: {
        organizationId: organizationId
      }
    });
  }
}
