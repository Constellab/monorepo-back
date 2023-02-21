import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnLabInstance} from './cn-lab-instance.entity';
import {DataSource, DeleteResult, EntityManager, Repository} from 'typeorm';
import {CnLabInstanceStatus} from './status/cn-lab-instance-status.enum';
import {CnAbstractWithStatusService} from '../cn-core/class/cn-abstract-with-status.service';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {ClHelpService, ClPage, ClPageI} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnExperiment} from '../cn-projects-aggregate/cn-experiments/cn-experiment.entity';
import {CnExperimentsService} from '../cn-projects-aggregate/cn-experiments/cn-experiments.service';
import {CnUserSpaceInfo} from '../cn-users/cn-user-space-info.dto';
import {CnReportsService} from '../cn-projects-aggregate/cn-reports/cn-reports.service';
import {BlBadRequestException, BlSearchBuilder, BlSearchParams} from '@monorepo/back-core-lib';

@Injectable()
export class CnLabInstancesService extends CnAbstractWithStatusService<CnLabInstance, CnLabInstanceStatus> {

  constructor(@InjectRepository(CnLabInstance) private repository: Repository<CnLabInstance>,
              @InjectRepository(CnLabInstanceStatusHistory) statusHistoRepo: Repository<CnLabInstanceStatusHistory>,
              private experimentService: CnExperimentsService,
              private reportService: CnReportsService,
              datasource: DataSource) {
    super(repository, CnLabInstance, statusHistoRepo, CnLabInstanceStatusHistory, datasource);
  }


  async create(entity: CnLabInstance, entityManager?: EntityManager): Promise<CnLabInstance> {
    this.checkLabInstanceBeforeSave(entity);

    if (entityManager) {
      return super.createWithStatusTransaction(entity, CnLabInstanceStatus.STOPPED, entityManager);
    } else {
      return super.createWithStatus(entity, CnLabInstanceStatus.STOPPED);
    }
  }

  async update(entity: CnLabInstance, entityManager?: EntityManager): Promise<CnLabInstance> {
    this.checkLabInstanceBeforeSave(entity);
    return super.update(entity, entityManager);
  }

  private checkLabInstanceBeforeSave(entity: CnLabInstance): void {
    if (entity.isCloud()) {
      if (ClHelpService.isNullOrEmpty(entity.virtualHost) ||
        ClHelpService.isNullOrEmpty(entity.serverInfo) ||
        ClHelpService.isNullOrEmpty(entity.region) ||
        ClHelpService.isNullOrEmpty(entity.billingMode) ||
        ClHelpService.isNullOrEmpty(entity.volumeType) ||
        ClHelpService.isNullOrEmpty(entity.volumeSize)) {
        throw new BlBadRequestException('Missing parameters for cloud instance');
      }

      if (entity.region.cloudProvider.id !== entity.serverInfo.cloudProvider.id) {
        throw new BlBadRequestException('Cloud Provider and Region must be the same');
      }

      entity.onPremisePlatform = null;
    } else {
      if (ClHelpService.isNullOrEmpty(entity.onPremisePlatform)) {
        throw new BlBadRequestException('Missing parameters platform for on premise instance');
      }

      entity.virtualHost = null;
      entity.serverInfo = null;
      entity.region = null;
      entity.billingMode = null;
      entity.volumeType = null;
      entity.volumeSize = null;
      entity.labManagerApiKey = null;
      entity.codelabToken = null;
      entity.serverInstanceId = null;
      entity.serverVolumeId = null;
    }
  }

  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const experiments: CnExperiment[] = await this.experimentService.getExperimentsByLabInstance(id);
    if (experiments?.length > 0) {
      throw new BlBadRequestException('Can\'t delete the lab instance because some experiment are linked to it');
    }

    const reports = await this.reportService.getReportsByLabInstance(id);
    if (reports?.length > 0) {
      throw new BlBadRequestException('Can\'t delete the lab instance because some reports are linked to it');
    }

    return super.deleteById(id, entityManager);
  }

  public async getCurrentLabInstances(page: number, size: number): Promise<ClPageI<CnLabInstance>> {
    const userInfo: CnUserSpaceInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    return this.findPaginated(page, size, {
      where: {
        sharedGroups: {
          userId: userInfo.userId
        },
        spaceId: userInfo.spaceId
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }

  public async getCurrentRunningLabInstances(): Promise<CnLabInstance[]> {
    const userInfo: CnUserSpaceInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    return this.repository.find({
      where: {
        sharedGroups: {
          userId: userInfo.userId
        },
        currentStatus: {
          status: CnLabInstanceStatus.RUNNING
        },
        spaceId: userInfo.spaceId
      },
      relations: ['currentStatus'],
      order: {
        lastModifiedAt: 'DESC' as any
      }
    });
  }

  public markInstanceAsRunning(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatusIfChanged(CnLabInstanceStatus.RUNNING, id);
  }

  public markInstanceAsStopped(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatusIfChanged(CnLabInstanceStatus.STOPPED, id);
  }

  public markInstanceAsStarting(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatusIfChanged(CnLabInstanceStatus.STARTING, id);
  }

  public markInstanceAsStopping(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatusIfChanged(CnLabInstanceStatus.STOPPING, id);
  }


  public findLabByApiKey(apiKey: string): Promise<CnLabInstance> {
    return this.repository.findOne({
      where: {
        glabApiKey: apiKey
      },
      relations: {space: true}
    });
  }


  public async findBySpace(spaceId: string, page: number, size: number): Promise<ClPage<CnLabInstance>> {
    return this.findPaginated(page, size, {
      where: {
        spaceId: spaceId
      }
    });
  }

  public async searchInSpace(spaceId: string, searchParams: BlSearchParams,
                             page: number, size: number): Promise<ClPage<CnLabInstance>> {
    const searchBuilder = new BlSearchBuilder<CnLabInstance>();
    searchBuilder.addSearchParams(searchParams);
    searchBuilder.mergeWhereOptions({spaceId: spaceId});

    return this.findPaginated(page, size, searchBuilder.build());

  }

  public async searchAll(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnLabInstance>> {
    const searchBuilder = new BlSearchBuilder<CnLabInstance>();
    searchBuilder.addSearchParams(searchParams);
    searchBuilder.setRelations({space: true});

    return this.findPaginated(page, size, searchBuilder.build());
  }

  public async updateServerStatusText(labInstanceId: string, text: string): Promise<CnLabInstance> {
    const labInstance = await this.findByIdAndCheck(labInstanceId);
    labInstance.serverProgressText = text;
    return this.repository.save(labInstance);
  }
}
