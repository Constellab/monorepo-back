import { BlBadRequestException, BlSearchBuilder, BlSearchParams } from '@monorepo/back-core-lib';
import { ClDateHelper, ClHelpService, ClPage, ClPageI } from '@monorepo/core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import {
  DataSource,
  DeleteResult,
  EntityManager,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  Raw,
  Repository,
} from 'typeorm';

import { CnAbstractWithStatusService } from '../cn-core/class/cn-abstract-with-status.service';
import { CnNotesService } from '../cn-folders-aggregate/cn-notes/cn-notes.service';
import { CnScenario } from '../cn-folders-aggregate/cn-scenarios/cn-scenario.entity';
import { CnScenariosService } from '../cn-folders-aggregate/cn-scenarios/cn-scenarios.service';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';
import { CnServerCloud } from '../cn-servers-info/server-cloud/cn-server-cloud.entity';
import { CnServerStandard } from '../cn-servers-info/server-standard/cn-server-standard.entity';
import { CnLabBackupStatus } from './backup/cn-lab-backup.dto';
import { CN_LAB_SEARCH_FILTER_HAS_ACTIVE_BACKUP } from './cn-lab.dto';
import { CnLab, CnLabEntity, CnLabFull, CnLabType, CnLabWithSpace } from './cn-lab.entity';
import {
  CN_LAB_EVENT_NAME,
  CnLabEvent,
  CnLabServerTaskStatusChangedEvent,
  CnLabStatusChangedEvent,
} from './cn-lab.event';
import { CN_LAB_TEMPORARY_STATUSES, CnLabServerTaskStatus, CnLabStatus } from './status/cn-lab-status.enum';
import { CnLabStatusHistory } from './status/cn-lab-status-history.entity';

@Injectable()
export class CnLabsService extends CnAbstractWithStatusService<CnLabEntity, CnLabStatus> {
  private static readonly logger = new Logger(CnLabsService.name);

  constructor(
    @InjectRepository(CnLabEntity) private repository: Repository<CnLabEntity>,
    @InjectRepository(CnLabStatusHistory) private statusRepo: Repository<CnLabStatusHistory>,
    private scenarioService: CnScenariosService,
    private noteService: CnNotesService,
    private eventEmitter: EventEmitter2,
    datasource: DataSource
  ) {
    super(repository, CnLabEntity, statusRepo, CnLabStatusHistory, datasource);
  }

  public async findByIdAndCheckWithSpace(id: string): Promise<CnLabWithSpace> {
    return super.findByIdAndCheck(id, CnLabEntity.relationSpace);
  }

  public async findByIdAndCheckFull(id: string): Promise<CnLabFull> {
    return super.findByIdAndCheck(id, CnLabEntity.relationFull);
  }

  async createLab(entity: CnLabEntity, entityManager: EntityManager): Promise<CnLabEntity> {
    await this.checkLabBeforeSave(entity);

    return super.createWithStatusTransaction(entity, CnLabStatus.NO_SERVER, entityManager);
  }

  async updateLab(entity: CnLabFull, entityManager?: EntityManager): Promise<CnLabFull> {
    await this.checkLabBeforeSave(entity);
    await super.update(entity as CnLabEntity, entityManager);
    return super.findByIdAndCheck(entity.id, CnLabEntity.relationFull);
  }

  private async checkLabBeforeSave(entity: CnLabFull): Promise<void> {
    this.checkLabName(entity.name);
    if (entity.isCloud()) {
      await this.checkCloudLabBeforeSave(entity);
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
      entity.labManagerApiKey = null;
      entity.codelabToken = null;
      entity.serverInstanceId = null;
      entity.serverVolumeId = null;
    }
  }

  private async checkCloudLabBeforeSave(entity: CnLabFull): Promise<void> {
    // check virtual host
    entity.virtualHost = await this.checkLabVirtualHost(entity, true);

    if (
      entity.serverCloud == null ||
      entity.region == null ||
      ClHelpService.isNullOrEmpty(entity.billingMode)
    ) {
      throw new BlBadRequestException('Missing parameters for cloud instance');
    }

    if (
      entity.region.cloudProvider == null ||
      entity.region.cloudProvider.id !== entity.serverCloud.cloudProvider.id
    ) {
      throw new BlBadRequestException('The server and region have different cloud provider');
    }

    if (!entity.region.supportsServer()) {
      throw new BlBadRequestException('Region must be a server region');
    }

    entity.desktopPlatform = null;
  }

  private checkLabName(labName: string): void {
    if (ClHelpService.isNullOrEmpty(labName)) {
      throw new BlBadRequestException('Name is required');
    }
  }

  private async checkLabVirtualHost(entity: CnLab, checkSupportedDomains: boolean): Promise<string> {
    const virtualHost = entity.virtualHost;
    // check domain name
    if (virtualHost == null || ClHelpService.isNullOrEmpty(virtualHost)) {
      throw new BlBadRequestException('Virtual host is required');
    }

    // check that the virtual host is not already used
    const lab = await this.repository.findOne({
      where: {
        virtualHost: virtualHost,
        id: entity.id ? Not(entity.id) : undefined,
      },
    });
    if (lab) {
      throw new BlBadRequestException(`Virtual host already used by another lab : ${virtualHost}`);
    }

    // check domain name
    if (checkSupportedDomains && !CnLabEntity.SUPPORTED_MAIN_DOMAINS.includes(entity.getMainDomain())) {
      throw new BlBadRequestException(
        `Virtual host must be a valid domain name : ${CnLabEntity.SUPPORTED_MAIN_DOMAINS.join(', ')}`
      );
    }

    // check that the domain is valid including possibility of subdomain and port,
    // only 1 ':' is allowed followed by a port number
    if (!/^(?:[a-z0-9-]+\.)*[a-z0-9-]+(?::\d+)?$/.test(virtualHost)) {
      throw new BlBadRequestException('Virtual host is not a valid domain name');
    }

    const domainPart = entity.getSubDomainName();
    // check that the virtual host does not contain character other than a-z, 0-9 and -
    if (!/^[a-z0-9-]+$/.test(domainPart)) {
      throw new BlBadRequestException("Virtual host can contain only alphanumeric characters and '-'");
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
    if (
      !ClHelpService.isNullOrEmpty(lab.serverInstanceId) ||
      !ClHelpService.isNullOrEmpty(lab.serverVolumeId)
    ) {
      throw new BlBadRequestException(
        "Can't delete the lab because the server or volume still exist. Please delete them first"
      );
    }
    const scenarios: CnScenario[] = await this.scenarioService.findByLab(id);
    if (scenarios?.length > 0) {
      throw new BlBadRequestException("Can't delete the lab because some scenario are linked to it");
    }

    const notes = await this.noteService.findByLab(id);
    if (notes?.length > 0) {
      throw new BlBadRequestException("Can't delete the lab because some notes are linked to it");
    }

    return super.deleteById(id, entityManager);
  }

  public async getUserLabs(
    userId: string,
    spaceId: string,
    page: number,
    size: number
  ): Promise<ClPageI<CnLab>> {
    return this.findPaginated(page, size, {
      where: this.getLabByUserAndSpaceFindOptions(userId, spaceId),
      order: { lastModifiedAt: 'DESC' },
    });
  }

  public async getAllLabsByUserAndSpace(userId: string, spaceId: string): Promise<CnLab[]> {
    return this.repository.find({
      where: this.getLabByUserAndSpaceFindOptions(userId, spaceId),
      order: { lastModifiedAt: 'DESC' },
    });
  }

  public async getUserRunningLabs(userId: string, spaceId: string): Promise<CnLab[]> {
    const findWhereOption = this.getLabByUserAndSpaceFindOptions(userId, spaceId);

    findWhereOption.currentStatus = {
      status: CnLabStatus.SERVER_RUNNING,
    };

    return this.repository.find({
      where: findWhereOption,
      order: {
        lastModifiedAt: 'DESC',
      },
    });
  }

  private getLabByUserAndSpaceFindOptions(userId: string, spaceId: string): FindOptionsWhere<CnLabEntity> {
    return {
      sharedGroups: {
        userId: userId,
      },
      spaceId: spaceId,
    };
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
        status: status,
      },
    });
  }

  // override the status change event to emit a lab event
  async updateCurrentStatusIfChangedWithDbEntity(
    status: CnLabStatus,
    dbEntity: CnLabEntity
  ): Promise<CnLabEntity> {
    if (dbEntity.currentStatus.status === status) {
      return dbEntity;
    }

    const oldStatus = dbEntity.currentStatus.status;
    const newLab = await this.updateCurrentStatusWithDbEntity(status, dbEntity);
    const event: CnLabStatusChangedEvent = {
      labId: newLab.id,
      newStatus: newLab.currentStatus.status,
      oldStatus: oldStatus,
      type: 'LAB_STATUS_CHANGED',
    };
    this.emitLabEvent(event);
    return newLab;
  }

  public findLabByGlabProdApiKey(apiKey: string): Promise<CnLabWithSpace | null> {
    return this.repository.findOne({
      where: {
        glabProdApiKey: apiKey,
      },
      relations: CnLabEntity.relationSpace,
    });
  }

  public findLabByGlabDevApiKey(apiKey: string): Promise<CnLabWithSpace | null> {
    return this.repository.findOne({
      where: {
        glabDevApiKey: apiKey,
      },
      relations: CnLabEntity.relationSpace,
    });
  }

  public findLabByManagerApiKey(managerApiKey: string): Promise<CnLabWithSpace | null> {
    return this.repository.findOne({
      where: {
        labManagerApiKey: managerApiKey,
      },
      relations: CnLabEntity.relationSpace,
    });
  }

  public async findBySpace(spaceId: string, page: number, size: number): Promise<ClPage<CnLab>> {
    return this.findPaginated(page, size, {
      where: {
        spaceId: spaceId,
      },
    });
  }

  /**
   * @param restrictToUserId when set, only the labs this user is a member of are returned —
   * the same restriction as {@link getUserLabs}. Left undefined the search covers the whole
   * Space, which is what a Space admin is allowed to see.
   */
  public async searchInSpace(
    spaceId: string,
    searchParams: BlSearchParams,
    page: number,
    size: number,
    restrictToUserId?: string
  ): Promise<ClPage<CnLabFull>> {
    const searchBuilder = new BlSearchBuilder<CnLabEntity>();
    searchBuilder.addSearchParams(searchParams);
    searchBuilder.mergeWhereOptions({ spaceId: spaceId });
    if (restrictToUserId != null) {
      searchBuilder.mergeWhereOptions({ sharedGroups: { userId: restrictToUserId } });
    }
    searchBuilder.setRelations(CnLabEntity.relationFull);

    return this.findPaginated(page, size, searchBuilder.build());
  }

  public async searchAll(
    searchParams: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnLabFull>> {
    // 'hasActiveBackup' is a virtual filter: it is not a column of the lab entity but a condition over
    // the backup history. We extract it from the search params (so the generic search builder does not
    // try to translate it into a where clause) and apply it as a sub-query on the backup history table.
    const hasActiveBackup = searchParams.getFilterValue(CN_LAB_SEARCH_FILTER_HAS_ACTIVE_BACKUP) === true;
    searchParams.removeFilter(CN_LAB_SEARCH_FILTER_HAS_ACTIVE_BACKUP);

    const searchBuilder = new BlSearchBuilder<CnLabEntity>();
    searchBuilder.addSearchParams(searchParams);
    searchBuilder.setRelations(CnLabEntity.relationFull);

    // restrict the search to labs that currently have a backup stored. A backup is evaluated per
    // frequency (daily / weekly): a frequency is "stored" when its most recent history row (by startedAt)
    // is a SUCCESS. The lab matches if AT LEAST ONE frequency is still stored, so a lab keeps matching
    // even if one frequency was deleted while another frequency still holds a successful backup.
    // Done as a correlated sub-query so it stays a single query.
    if (hasActiveBackup) {
      searchBuilder.mergeWhereOptions({
        id: Raw(
          (labId) => `EXISTS (
            SELECT 1 FROM lab_backup_history h
            WHERE h.lab_id = ${labId}
              AND h.status = :backupSuccessStatus
              AND NOT EXISTS (
                SELECT 1 FROM lab_backup_history newer
                WHERE newer.lab_id = h.lab_id
                  AND newer.frequency = h.frequency
                  AND newer.started_at > h.started_at
              )
          )`,
          { backupSuccessStatus: CnLabBackupStatus.SUCCESS }
        ),
      });
    }

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
      type: 'LAB_SERVER_TASK_STATUS_CHANGED',
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
  public async getCloudLabsWithTempStatus(): Promise<CnLab[]> {
    return this.repository.find({
      where: {
        currentStatus: {
          status: In(CN_LAB_TEMPORARY_STATUSES),
        },
        type: CnLabType.CLOUD,
      },
    });
  }

  public async getLabServerCloud(labId: string): Promise<CnServerCloud> {
    const lab = await this.findByIdAndCheck(labId, { serverCloud: true });
    if (lab.serverCloud == null) {
      throw new BlBadRequestException('Lab has no server cloud configured');
    }
    return lab.serverCloud;
  }

  public async getLabServerStandard(labId: string): Promise<CnServerStandard> {
    const lab = await this.findByIdAndCheck(labId, { serverCloud: true });
    if (lab.serverCloud == null) {
      throw new BlBadRequestException('Lab has no server cloud configured');
    }
    return lab.serverCloud.serverStandard;
  }

  private emitLabEvent(labEvent: CnLabEvent): void {
    this.eventEmitter.emit(CN_LAB_EVENT_NAME, labEvent);
  }

  // TODO to remove
  public async createGlabDevApiKey(): Promise<void> {
    CnLabsService.logger.log('[MIGRATION] Start creating glab dev api key');

    const labs = await this.repository.find({
      where: {
        glabDevApiKey: IsNull(),
      },
    });

    for (const lab of labs) {
      lab.glabDevApiKey = randomBytes(48).toString('base64').replace(/\W/g, '');
      await this.repository.save(lab, { listeners: false });
    }

    CnLabsService.logger.log('[MIGRATION] End creating glab dev api key');
  }
}
