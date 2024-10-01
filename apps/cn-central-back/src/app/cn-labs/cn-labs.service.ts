import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CnLab, CnLabEntity, CnLabFull, CnLabWithSpace } from './cn-lab.entity';
import { DataSource, DeleteResult, EntityManager, In, Not, Repository } from 'typeorm';
import { CnLabServerTaskStatus, CnLabStatus, cnLabTemporaryStatuses } from './status/cn-lab-status.enum';
import { CnAbstractWithStatusService } from '../cn-core/class/cn-abstract-with-status.service';
import { CnLabStatusHistory } from './status/cn-lab-status-history.entity';
import { ClDateHelper, ClHelpService, ClPage, ClPageI } from '@monorepo/core-lib';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnExperiment } from '../cn-folders-aggregate/cn-experiments/cn-experiment.entity';
import { CnExperimentsService } from '../cn-folders-aggregate/cn-experiments/cn-experiments.service';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { CnNotesService } from '../cn-folders-aggregate/cn-notes/cn-notes.service';
import { BlBadRequestException, BlSearchBuilder, BlSearchParams } from '@monorepo/back-core-lib';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CnLabEvent, cnLabEventName, CnLabServerTaskStatusChangedEvent, CnLabStatusChangedEvent } from './cn-lab.event';
import { CnServerStandard } from '../cn-servers-info/server-standard/cn-server-standard.entity';
import { CnServerCloud } from '../cn-servers-info/server-cloud/cn-server-cloud.entity';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';

@Injectable()
export class CnLabsService extends CnAbstractWithStatusService<CnLabEntity, CnLabStatus> {

  constructor(@InjectRepository(CnLabEntity) private repository: Repository<CnLabEntity>,
              @InjectRepository(CnLabStatusHistory) private statusRepo: Repository<CnLabStatusHistory>,
              private experimentService: CnExperimentsService,
              private noteService: CnNotesService,
              private eventEmitter: EventEmitter2,
              datasource: DataSource) {
    super(repository, CnLabEntity, statusRepo, CnLabStatusHistory, datasource);
  }

  public async findByIdAndCheckWithSpace(id: string): Promise<CnLabWithSpace> {
    return super.findByIdAndCheck(id, CnLabEntity.relationSpace);
  }

  public async findByIdAndCheckFull(id: string): Promise<CnLabFull> {
    return super.findByIdAndCheck(id, CnLabEntity.relationFull);
  }

  async create(entity: CnLabEntity, entityManager?: EntityManager): Promise<CnLabEntity> {

    await this.checkLabBeforeSave(entity);

    if (entityManager) {
      return super.createWithStatusTransaction(entity, CnLabStatus.NO_SERVER, entityManager);
    } else {
      return super.createWithStatus(entity, CnLabStatus.NO_SERVER);
    }
  }

  async updateLab(entity: CnLabFull, entityManager?: EntityManager): Promise<CnLabWithSpace> {
    await this.checkLabBeforeSave(entity);
    await super.update(entity as CnLabEntity, entityManager);
    return this.findById(entity.id, CnLabEntity.relationSpace);
  }

  private async checkLabBeforeSave(entity: CnLabFull): Promise<void> {
    this.checkLabName(entity.name);
    if (entity.isCloud()) {
      // check virtual host
      entity.virtualHost = await this.checkLabVirtualHost(entity, true);

      if (ClHelpService.isNullOrEmpty(entity.serverCloud) ||
        ClHelpService.isNullOrEmpty(entity.region) ||
        ClHelpService.isNullOrEmpty(entity.billingMode) ||
        ClHelpService.isNullOrEmpty(entity.volumeType) ||
        ClHelpService.isNullOrEmpty(entity.volumeSize)) {
        throw new BlBadRequestException('Missing parameters for cloud instance');
      }

      if (entity.region.cloudProvider.id !== entity.serverCloud.cloudProvider.id) {
        throw new BlBadRequestException('The server and region have different cloud provider');
      }

      if (!entity.region.supportsServer()) {
        throw new BlBadRequestException('Region must be a server region');
      }

      entity.desktopPlatform = null;
    } else if (entity.isOnPremise()) {
      // check virtual host
      entity.virtualHost = await this.checkLabVirtualHost(entity, false);
      entity.desktopPlatform = null;

    } else if (entity.isDesktop()) {
      if (ClHelpService.isNullOrEmpty(entity.desktopPlatform)) {
        throw new BlBadRequestException('Missing parameters platform for desktop instance');
      }

      entity.virtualHost = null;
      entity.serverCloud = null;
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

  private checkLabName(labName: string): void {
    if (ClHelpService.isNullOrEmpty(labName)) {
      throw new BlBadRequestException('Name is required');
    }
  }

  private async checkLabVirtualHost(entity: CnLab, checkSupportedDomains: boolean): Promise<string> {

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
      throw new BlBadRequestException(`Virtual host already used by another lab : ${virtualHost}`);
    }

    // check domain name
    if (checkSupportedDomains && !CnLabEntity.SUPPORTED_MAIN_DOMAINS.includes(entity.getMainDomain())) {
      throw new BlBadRequestException(
        `Virtual host must be a valid domain name : ${CnLabEntity.SUPPORTED_MAIN_DOMAINS.join(', ')}`);
    }

    // check that the domain is valid including possibility of subdomain and port, only 1 ':' is allowed followed by a port number
    if (!/^(?:[a-z0-9-]+\.)*[a-z0-9-]+(?::\d+)?$/.test(virtualHost)) {
      throw new BlBadRequestException('Virtual host is not a valid domain name');
    }

    const domainPart = entity.getSubDomainName();
    // check that the virtual host does not contain character other than a-z, 0-9 and -
    if (!/^[a-z0-9-]+$/.test(domainPart)) {
      throw new BlBadRequestException('Virtual host can contain only alphanumeric characters and \'-\'');
    }

    // force the virtual host to be lower case
    return virtualHost.toLowerCase();
  }

  public async updateLabConfig(labId: string, labConfig: CnLabConfig): Promise<CnLab> {
    return this.updatePartial(labId, { labConfig: labConfig });
  }

  public async updateLabName(labId: string, name: string): Promise<CnLab> {
    this.checkLabName(name);
    return this.updatePartial(labId, { name: name });
  }

  async deleteById(id: string, entityManager: EntityManager): Promise<DeleteResult> {
    const lab = await this.findByIdAndCheck(id);
    if (!ClHelpService.isNullOrEmpty(lab.serverInstanceId) || !ClHelpService.isNullOrEmpty(lab.serverVolumeId)) {
      throw new BlBadRequestException('Can\'t delete the lab because the server or volume still exist. Please delete them first');
    }
    const experiments: CnExperiment[] = await this.experimentService.getExperimentsByLab(id);
    if (experiments?.length > 0) {
      throw new BlBadRequestException('Can\'t delete the lab because some experiment are linked to it');
    }

    const notes = await this.noteService.getNotesByLab(id);
    if (notes?.length > 0) {
      throw new BlBadRequestException('Can\'t delete the lab because some notes are linked to it');
    }

    return super.deleteById(id, entityManager);
  }

  public async getCurrentLabs(page: number, size: number): Promise<ClPageI<CnLab>> {
    const userInfo: CnUserSpaceInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    return this.findPaginated(page, size, {
      where: {
        sharedGroups: {
          userId: userInfo.userId
        },
        spaceId: userInfo.spaceId
      },
      order: { lastModifiedAt: 'DESC' as any }
    });
  }

  public async getCurrentRunningLabs(): Promise<CnLab[]> {
    const userInfo: CnUserSpaceInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    return this.repository.find({
      where: {
        sharedGroups: {
          userId: userInfo.userId
        },
        currentStatus: {
          status: CnLabStatus.SERVER_RUNNING
        },
        spaceId: userInfo.spaceId
      },
      order: {
        lastModifiedAt: 'DESC' as any
      }
    });
  }

  public async markInstanceAsServerRunning(id: string): Promise<CnLab> {
    return this.updateCurrentStatusIfChanged(CnLabStatus.SERVER_RUNNING, id);
  }

  public async markInstanceAsLabRunning(id: string): Promise<CnLab> {
    await this.clearServerTask(id);
    return this.updateCurrentStatusIfChanged(CnLabStatus.LAB_RUNNING, id);
  }

  public async markInstanceAsServerStopped(id: string): Promise<CnLab> {
    await this.clearServerTask(id);
    return this.updateCurrentStatusIfChanged(CnLabStatus.SERVER_STOPPED, id);
  }

  public markInstanceAsServerStarting(id: string): Promise<CnLab> {
    return this.updateCurrentStatusIfChanged(CnLabStatus.SERVER_STARTING, id);
  }

  public markInstanceAsServerStopping(id: string): Promise<CnLab> {
    return this.updateCurrentStatusIfChanged(CnLabStatus.SERVER_STOPPING, id);
  }

  public async markInstanceAsNoServer(id: string): Promise<CnLab> {
    await this.clearServerTask(id);
    return this.updateCurrentStatusIfChanged(CnLabStatus.NO_SERVER, id);
  }

  // public markInstanceAsServerConfiguring(id: string): Promise<CnLab> {
  //   return this.updateCurrentStatusIfChanged(CnLabStatus.SERVER_CONFIGURING, id);
  // }

  public markInstanceAsServerConfigured(id: string): Promise<CnLab> {
    return this.updateCurrentStatusIfChanged(CnLabStatus.SERVER_CONFIGURED, id);
  }

  public async markInstanceAsError(id: string, text: string): Promise<CnLab> {
    await this.updateCurrentStatusIfChanged(CnLabStatus.ERROR, id);
    return this.updateServerTask(id, text, CnLabServerTaskStatus.ERROR);
  }

  /**
   * Return true if the lab was started once
   */
  public async findByStatus(id: string, status: CnLabStatus): Promise<CnLabStatusHistory[]> {
    return await this.statusRepo.find({
      where: {
        entity: { id: id },
        status: status
      }
    });
  }

  // override the status change event to emit a lab event
  async updateCurrentStatusIfChangedWithDbEntity(status: CnLabStatus, dbEntity: CnLabEntity): Promise<CnLabEntity> {
    if (dbEntity.currentStatus.status === status) {
      return dbEntity;
    }

    const oldStatus = dbEntity.currentStatus.status;
    const newLab = await this.updateCurrentStatusWithDbEntity(status, dbEntity);
    const event: CnLabStatusChangedEvent = {
      labId: newLab.id,
      newStatus: newLab.currentStatus.status,
      oldStatus: oldStatus,
      type: 'LAB_STATUS_CHANGED'
    };
    this.emitLabEvent(event);
    return newLab;
  }


  public findLabByApiKey(apiKey: string): Promise<CnLabWithSpace> {
    return this.repository.findOne({
      where: {
        glabApiKey: apiKey
      },
      relations: CnLabEntity.relationSpace
    });
  }

  public findLabByManagerApiKey(managerApiKey: string): Promise<CnLabWithSpace> {
    return this.repository.findOne({
      where: {
        labManagerApiKey: managerApiKey
      },
      relations: CnLabEntity.relationSpace
    });
  }


  public async findBySpace(spaceId: string, page: number, size: number): Promise<ClPage<CnLab>> {
    return this.findPaginated(page, size, {
      where: {
        spaceId: spaceId
      }
    });
  }

  public async searchInSpace(spaceId: string, searchParams: BlSearchParams,
                             page: number, size: number): Promise<ClPage<CnLabFull>> {
    const searchBuilder = new BlSearchBuilder<CnLabEntity>();
    searchBuilder.addSearchParams(searchParams);
    searchBuilder.mergeWhereOptions({ spaceId: spaceId });
    searchBuilder.setRelations(CnLabEntity.relationFull);

    return this.findPaginated(page, size, searchBuilder.build());

  }

  public async searchAll(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnLabFull>> {
    const searchBuilder = new BlSearchBuilder<CnLabEntity>();
    searchBuilder.addSearchParams(searchParams);
    searchBuilder.setRelations(CnLabEntity.relationFull);

    return this.findPaginated(page, size, searchBuilder.build());
  }

  public clearServerTask(labId: string): Promise<CnLab> {
    return this.updateServerTask(labId, '', CnLabServerTaskStatus.NONE);
  }

  /**
   * Update the server task text and status
   * A running server task must always be updated to SUCCESS or ERROR after the task is finished
   * @param labId
   * @param text
   * @param status
   */
  public async updateServerTask(labId: string, text: string, status: CnLabServerTaskStatus): Promise<CnLab> {
    const lab = await this.findByIdAndCheck(labId);
    const event: CnLabServerTaskStatusChangedEvent = {
      labId: labId,
      newStatus: status,
      oldStatus: lab.serverTaskStatus,
      type: 'LAB_SERVER_TASK_STATUS_CHANGED'
    };

    lab.serverTaskText = text;
    lab.serverTaskStatus = status;
    lab.serverTaskDatetime = ClDateHelper.getDate();
    const labDb = await this.repository.save(lab);

    this.emitLabEvent(event);

    return labDb;
  }

  /**
   * Retrieve the complete list of labs where current status is
   * temporary (like server starting, stopping, etc...)
   */
  public async getLabsWithTempStatus(): Promise<CnLab[]> {
    return this.repository.find({
      where: {
        currentStatus: {
          status: In(cnLabTemporaryStatuses)
        }
      }
    });
  }

  public async getLabServerCloud(labId: string): Promise<CnServerCloud> {
    const lab = await this.findByIdAndCheck(labId, { serverCloud: true });
    return lab.serverCloud;
  }

  public async getLabServerStandard(labId: string): Promise<CnServerStandard> {
    const lab = await this.findByIdAndCheck(labId, { serverCloud: true });
    return lab.serverCloud?.serverStandard;
  }

  private emitLabEvent(labEvent: CnLabEvent): void {
    this.eventEmitter.emit(cnLabEventName, labEvent);
  }
}
