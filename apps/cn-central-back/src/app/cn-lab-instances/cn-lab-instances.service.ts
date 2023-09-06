import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnLabInstance, CnLabInstanceType} from './cn-lab-instance.entity';
import {DataSource, DeleteResult, EntityManager, In, Not, Repository} from 'typeorm';
import {
  cnLabInstanceRunningStatuses,
  CnLabInstanceServerTaskStatus,
  CnLabInstanceStatus,
  cnLabInstanceTemporaryStatuses
} from './status/cn-lab-instance-status.enum';
import {CnAbstractWithStatusService} from '../cn-core/class/cn-abstract-with-status.service';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {ClDateHelper, ClHelpService, ClPage, ClPageI} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnExperiment} from '../cn-projects-aggregate/cn-experiments/cn-experiment.entity';
import {CnExperimentsService} from '../cn-projects-aggregate/cn-experiments/cn-experiments.service';
import {CnUserSpaceInfo} from '../cn-users/cn-user.dto';
import {CnReportsService} from '../cn-projects-aggregate/cn-reports/cn-reports.service';
import {BlBadRequestException, BlSearchBuilder, BlSearchParams} from '@monorepo/back-core-lib';
import {CnLabInstanceStatusRunRequest, CnLabInstanceStatusRunResponse} from './cn-lab-instance.dto';
import {DateTime} from 'luxon';

@Injectable()
export class CnLabInstancesService extends CnAbstractWithStatusService<CnLabInstance, CnLabInstanceStatus> {

  public static readonly SUPPORTED_MAIN_DOMAINS = ['gencovery.io', 'constellab.app'];

  constructor(@InjectRepository(CnLabInstance) private repository: Repository<CnLabInstance>,
              @InjectRepository(CnLabInstanceStatusHistory) private statusRepo: Repository<CnLabInstanceStatusHistory>,
              private experimentService: CnExperimentsService,
              private reportService: CnReportsService,
              datasource: DataSource) {
    super(repository, CnLabInstance, statusRepo, CnLabInstanceStatusHistory, datasource);
  }


  async create(entity: CnLabInstance, entityManager?: EntityManager): Promise<CnLabInstance> {
    await this.checkLabInstanceBeforeSave(entity);

    if (entityManager) {
      return super.createWithStatusTransaction(entity, CnLabInstanceStatus.SERVER_NOT_CONFIGURED, entityManager);
    } else {
      return super.createWithStatus(entity, CnLabInstanceStatus.SERVER_NOT_CONFIGURED);
    }
  }

  async update(entity: CnLabInstance, entityManager?: EntityManager): Promise<CnLabInstance> {
    await this.checkLabInstanceBeforeSave(entity);
    return super.update(entity, entityManager);
  }

  private async checkLabInstanceBeforeSave(entity: CnLabInstance): Promise<void> {
    entity.name = await this.checkLabInstanceName(entity);
    if (entity.isCloud()) {
      // check virtual host
      entity.virtualHost = await this.checkLabInstanceVirtualHost(entity);

      if (ClHelpService.isNullOrEmpty(entity.serverInfo) ||
        ClHelpService.isNullOrEmpty(entity.region) ||
        ClHelpService.isNullOrEmpty(entity.billingMode) ||
        ClHelpService.isNullOrEmpty(entity.volumeType) ||
        ClHelpService.isNullOrEmpty(entity.volumeSize)) {
        throw new BlBadRequestException('Missing parameters for cloud instance');
      }

      if (entity.region.cloudProvider.id !== entity.serverInfo.cloudProvider.id) {
        throw new BlBadRequestException('Cloud Provider and Region must be the same');
      }

      entity.desktopPlatform = null;
    } else {
      if (ClHelpService.isNullOrEmpty(entity.desktopPlatform)) {
        throw new BlBadRequestException('Missing parameters platform for desktop instance');
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

  private async checkLabInstanceName(entity: CnLabInstance): Promise<string> {

    const name = entity.name;
    if (ClHelpService.isNullOrEmpty(name)) {
      throw new BlBadRequestException('Name is required');
    }

    // check that the name does not contain character other than a-Z, 0-9.
    // And that it does not start or end with a -.
    if (!/^[a-zA-Z0-9-]+$/.test(name) || /^-|-$/.test(name)) {
      throw new BlBadRequestException('Name can only contain alphanumeric characters and \'-\'. It cannot start or end with a \'-\'.');
    }

    // check that the name is not already used for cloud lab
    if (entity.isCloud()) {
      const lab = await this.repository.findOne({
        where: {
          name: name,
          id: entity.id ? Not(entity.id) : undefined,
          type: CnLabInstanceType.CLOUD
        }
      });
      if (lab) {
        throw new BlBadRequestException(`A cloud lab with name ${name} already exist.`);
      }
    }

    return name;
  }

  private async checkLabInstanceVirtualHost(entity: CnLabInstance): Promise<string> {

    const virtualHost = entity.virtualHost;
    // check domain name
    if (ClHelpService.isNullOrEmpty(virtualHost)) {
      throw new BlBadRequestException('Virtual host is required');
    }

    // check that the virtual host is not already used
    const lab = await this.repository.findOne({
      where: {
        virtualHost: virtualHost,
        id: entity.id ? Not(entity.id) : undefined
      }
    });
    if (lab) {
      throw new BlBadRequestException(`Virtual host already used by another lab instance : ${virtualHost}`);
    }

    // check domain name
    if (!CnLabInstancesService.SUPPORTED_MAIN_DOMAINS.includes(entity.getMainDomain())) {
      throw new BlBadRequestException(
        `Virtual host must be a valid domain name : ${CnLabInstancesService.SUPPORTED_MAIN_DOMAINS.join(', ')}`);
    }

    const domainPart = entity.getSubDomainName();
    // check that the virtual host does not contain character other than a-z, 0-9 and -
    if (!/^[a-z0-9-]+$/.test(domainPart)) {
      throw new BlBadRequestException('Virtual host can contain only alphanumeric characters and \'-\'');
    }

    // force the virtual host to be lower case
    return virtualHost.toLowerCase();
  }

  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const labInstance = await this.findByIdAndCheck(id);
    if (!ClHelpService.isNullOrEmpty(labInstance.serverInstanceId) || !ClHelpService.isNullOrEmpty(labInstance.serverVolumeId)) {
      throw new BlBadRequestException('Can\'t delete the lab instance because the server or volume still exist. Please delete them first');
    }
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
          status: CnLabInstanceStatus.SERVER_RUNNING
        },
        spaceId: userInfo.spaceId
      },
      relations: ['currentStatus'],
      order: {
        lastModifiedAt: 'DESC' as any
      }
    });
  }

  public markInstanceAsServerRunning(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatusIfChanged(CnLabInstanceStatus.SERVER_RUNNING, id);
  }

  public markInstanceAsLabRunning(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatusIfChanged(CnLabInstanceStatus.LAB_RUNNING, id);
  }

  public markInstanceAsServerStopped(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatusIfChanged(CnLabInstanceStatus.SERVER_STOPPED, id);
  }

  public markInstanceAsServerStarting(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatusIfChanged(CnLabInstanceStatus.SERVER_STARTING, id);
  }

  public markInstanceAsServerStopping(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatusIfChanged(CnLabInstanceStatus.SERVER_STOPPING, id);
  }

  public markInstanceAsServerNotConfigured(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatusIfChanged(CnLabInstanceStatus.SERVER_NOT_CONFIGURED, id);
  }


  public findLabByApiKey(apiKey: string): Promise<CnLabInstance> {
    return this.repository.findOne({
      where: {
        glabApiKey: apiKey
      },
      relations: {space: true}
    });
  }

  public findLabByManagerApiKey(managerApiKey: string): Promise<CnLabInstance> {
    return this.repository.findOne({
      where: {
        labManagerApiKey: managerApiKey
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

  public async updateServerTask(labInstanceId: string, text: string, status: CnLabInstanceServerTaskStatus): Promise<CnLabInstance> {
    const labInstance = await this.findByIdAndCheck(labInstanceId);
    labInstance.serverTaskText = text;
    labInstance.serverTaskStatus = status;
    labInstance.serverTaskDatetime = ClDateHelper.getDate();
    return this.repository.save(labInstance);
  }

  /**
   * Retrieve the complete list of lab instances where current status is
   * temporary (like server starting, stopping, etc...)
   */
  public async getLabInstancesWithTempStatus(): Promise<CnLabInstance[]> {
    return this.repository.find({
      where: {
        currentStatus: {
          status: In(cnLabInstanceTemporaryStatuses)
        }
      }
    });
  }
}
