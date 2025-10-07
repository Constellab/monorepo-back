import {
  BlDtoHelper,
  BlParseEnumPipe,
  BlParsePipe,
  BlResponseHelper,
  BlSearchParams,
} from '@monorepo/back-core-lib';
import { ClPage, ClPageI } from '@monorepo/core-lib';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';

import {
  CnLabManagerAdminerInfo,
  CnLabManagerCleanOptions,
  CnLabManagerComposeEnv,
  CnLabManagerComposeList,
  CnLabManagerComposeUpOptions,
  CnLabManagerContainerSize,
  CnLabManagerDockerInspect,
  CnLabManagerDockerLogs,
  CnLabManagerDockerPsFull,
  CnLabManagerErrorLogs,
  CnLabManagerRestoreBackupConfigDTO,
  CnManagerLabComposeRestartOptions,
  CnManagerLabPullBiotaOptions,
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnLabBackupStatusDTO, CnLabCheckBackupSizeDTO } from './backup/cn-lab-backup.dto';
import { CnLabBackupHistory } from './backup/cn-lab-backup-history.entity';
import {
  CnLabAdminDto,
  CnLabBusyStatusDTO,
  CnLabCloudCreateDTO,
  CnLabCodelabDTO,
  CnLabConfigDTO,
  CnLabCreateAdminDTO,
  CnLabCreateDesktopDTO,
  CnLabDto,
  CnLabFindOneDto,
  CnLabServerInfoDTO,
  CnLabStatusDTO,
  CnLabUpdateAdminDTO,
  CnLabWithSpaceDto,
  CnRequestLab,
  CnStopLabRequestDTO,
} from './cn-lab.dto';
import { CnLabEntity } from './cn-lab.entity';
import { CnLabAggregateService } from './cn-lab-aggregate.service';
import { CnLabMigrateService } from './cn-lab-migrate.service';
import { CnLabDesktopGenerateConfig } from './desktop/cn-lab-desktop.class';
import { CnLabGreenOptionFormDto } from './green-option/cn-lab-green-option.dto';
import { CnLabGreenOption } from './green-option/cn-lab-green-option.entity';
import { CnLabFreeCreateDto, CnLabFreeGetDto, CnLabFreeUpdateDto } from './lab-free/cn-lab-free.dto';
import { CnLabFreeAggregateService } from './lab-free/cn-lab-free-aggregate.service';
import { CnCpCompleteInfo } from './server/cn-cloud-provider.class';
import { CnLabStatsRunningResponseDTO } from './stats/cn-lab-running-stats.dto';
import { CnLabStatsRequestDTO } from './stats/cn-lab-stats.dto';
import { CnLabStatsStorageResponseDTO } from './stats/cn-lab-storage-stats.dto';
import { CnLabStatusHistory } from './status/cn-lab-status-history.entity';
import { CnLabUserRole, CnLabUserWithUser } from './user/cn-lab-user.entity';
import { CnLabUpdateVolumeDTO } from './volume/cn-lab-volume.dto';
import { CnLabVolume } from './volume/cn-lab-volume-entity';

@Controller('labs')
export class CnLabsController {
  constructor(
    private aggregateService: CnLabAggregateService,
    private labFreeAggregateService: CnLabFreeAggregateService,
    private migrateService: CnLabMigrateService
  ) {}

  @Post('cloud')
  async createCloudLab(
    @Body(new BlParsePipe(CnLabCloudCreateDTO)) createLab: CnLabCloudCreateDTO
  ): Promise<CnLabDto> {
    const lab = await this.aggregateService.createCloudLab(createLab);
    return new CnLabDto(lab);
  }

  @Put(':id/name')
  async updateLabName(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { name: string }
  ): Promise<CnLabDto> {
    const lab = await this.aggregateService.updateLabName(id, body.name);
    return new CnLabDto(lab);
  }

  @Post('request-lab')
  async requestLab(@Body() request: CnRequestLab): Promise<void> {
    await this.aggregateService.requestLab(request);
  }

  /**
   * return the list of running lab shared with the current user
   */
  @Get('current')
  public async getCurrentLabs(
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnLabDto>> {
    const labs = await this.aggregateService.getCurrentLabs(page, size);
    return BlDtoHelper.pageToDto(CnLabDto, labs);
  }

  /**
   * return the list of running lab created by the current user
   */
  @Get('current-running')
  public async getCurrentRunningLabs(): Promise<CnLabDto[]> {
    const labs = await this.aggregateService.getCurrentRunningLabs();
    return BlDtoHelper.listToDto(CnLabDto, labs);
  }

  @Get('current-space')
  async getByCurrentSpace(
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnLabDto>> {
    const labs = await this.aggregateService.getByCurrentSpace(page, size);
    return BlDtoHelper.pageToDto(CnLabDto, labs);
  }

  @Post('current-space/search')
  async searchInCurrentSpace(
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnLabWithSpaceDto>> {
    const labs = await this.aggregateService.searchInCurrentSpace(searchParam, page, size);
    return BlDtoHelper.pageToDto(CnLabWithSpaceDto, labs);
  }

  /**
   * Get the lab with user role for this lab
   * Keep this route after the current otherwise the current routes will not work
   */
  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabFindOneDto> {
    return await this.aggregateService.findByIdAndCheck(id);
  }

  @Get(':id/codelab')
  async findCodelabInfoById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabCodelabDTO> {
    return await this.aggregateService.findCodelabInfo(id);
  }

  /**
   * start a lab
   */
  @Put(':id/start')
  public async startInstance(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabDto> {
    const lab = await this.aggregateService.startInstance(id);
    return new CnLabDto(lab);
  }

  /**
   * stop a lab
   */
  @Put(':id/stop')
  public async stopInstance(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() stopRequest: CnStopLabRequestDTO
  ): Promise<CnLabDto> {
    const lab = await this.aggregateService.stopInstance(id, stopRequest);
    return new CnLabDto(lab);
  }

  /**
   * Route to update the lab configurer repository
   */
  @Put(':id/lab-configurer/update')
  public updateLabConfigurerRepository(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<CnLabStatusDTO> {
    return this.aggregateService.updateLabConfigurer(id);
  }

  @Put(':id/lab-configurer/migrate')
  public migrateToGithub(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabStatusDTO> {
    return this.migrateService.migrateToGithub(id);
  }

  @Put(':id/lab-configurer/migrate-dns-challenge')
  public migrateToDnsChallenge(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabStatusDTO> {
    return this.migrateService.migrateToDnsChallenge(id);
  }

  @Put(':id/lab-configurer/migrate-lab-manager-v2')
  public migrateToLabManagerV2(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabStatusDTO> {
    return this.migrateService.migrateToLabManagerV2(id);
  }

  @Put(':id/lab-configurer/destroy-containers')
  public destroyLabConfigurerContainers(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<CnLabStatusDTO> {
    return this.aggregateService.destroyLabConfigurerContainers(id);
  }

  /**
   * Get the url to log into the lab
   * return the lab
   */
  @Get(':id/login')
  public async login(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    const result = await this.aggregateService.login(id);
    // redirect to lab auto login page
    return { url: `${result.lab.glabUrl}/${CnLabEntity.CORE_API_ROUTE}/login-temp-access/${result.token}` };
  }

  /**
   * Check the lab status and returns settings if ok
   */
  @Get(':id/check-status')
  public checkStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.aggregateService.checkLabManagerStatus(id);
  }

  /**
   * Get the config of the lab
   */
  @Get(':id/config')
  public getLabConfig(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabConfig> {
    return this.aggregateService.getConfig(id);
  }

  @Put(':id/config')
  async updateConfig(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() config: CnLabConfigDTO
  ): Promise<void> {
    return await this.aggregateService.updateConfig(id, config);
  }

  @Get(':id/server-info')
  async getLabServerInfo(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabServerInfoDTO> {
    return await this.aggregateService.getLabServerInfo(id);
  }

  //////////////////////////// STATUS ////////////////////////////////
  /**
   * return the lab status
   */
  @Get(':id/status')
  getStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabStatusDTO> {
    return this.aggregateService.getLabStatus(id);
  }

  @Get(':id/status/busy')
  getBusyStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabBusyStatusDTO> {
    return this.aggregateService.getLabBusyStatus(id);
  }

  /**
   * return the history of the status
   */
  @Post(':id/status/history')
  public getStatusHistoryDatasource(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number,
    @Body(new BlParsePipe(BlSearchParams)) searchParams: BlSearchParams
  ): Promise<ClPageI<CnLabStatusHistory>> {
    return this.aggregateService.getLabStatusHistory(id, page, size, searchParams);
  }

  @Get(':id/status/users')
  public getUsersOfStatusHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnUser>> {
    return this.aggregateService.getUsersOfStatusHistory(id, page, size);
  }

  /**
   * stop a lab
   */
  @Put(':id/status/refresh')
  public refreshStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabStatusDTO> {
    return this.aggregateService.checkAndRefreshStatus(id);
  }

  //////////////////////////// VOLUME ////////////////////////////////

  @Put(':id/volume')
  public updateVolume(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new BlParsePipe(CnLabUpdateVolumeDTO)) updateVolume: CnLabUpdateVolumeDTO
  ): Promise<CnLabVolume> {
    return this.aggregateService.updateLabVolume(id, updateVolume);
  }

  @Get(':id/volume/current')
  public getCurrentVolume(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabVolume> {
    return this.aggregateService.getLabCurrentVolume(id);
  }

  @Get(':id/volume')
  public getVolumeHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPage<CnLabVolume>> {
    return this.aggregateService.getLabVolumeHistory(id, page, size);
  }

  @Delete(':id/volume/:volumeId')
  public deleteVolume(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('volumeId', new ParseUUIDPipe()) volumeId: string
  ): Promise<void> {
    return this.aggregateService.deleteLabVolumeHistory(id, volumeId);
  }

  //////////////////////////// USERS ////////////////////////////////

  @Post(':id/user/:userId/:role')
  public addUserToLab(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('role', new BlParseEnumPipe(CnLabUserRole)) role: CnLabUserRole
  ): Promise<CnLabUserWithUser> {
    return this.aggregateService.addUserToLab(id, userId, role);
  }

  @Put(':id/user/:userId/:role')
  public updateUserLabRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('role', new BlParseEnumPipe(CnLabUserRole)) role: CnLabUserRole
  ): Promise<CnLabUserWithUser> {
    return this.aggregateService.updateUserLabRole(id, userId, role);
  }

  @Delete(':id/user/:userId')
  public removeUserFromLab(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string
  ): Promise<void> {
    return this.aggregateService.removeUserFromLab(id, userId);
  }

  @Get(':id/user')
  public getLabSharedUsers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabUserWithUser[]> {
    return this.aggregateService.getLabSharedUsers(id);
  }

  //////////////////////////// LAB MANAGER ////////////////////////////////

  /////////////////////////// LAB MANAGER - STATUS & HEALTH ///////////////////////////

  /**
   * Route to update the docker image of the lab manager
   */
  @Put(':id/lab-manager/update/:version')
  public updateLabManager(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('version') version: string
  ): Promise<CnLabStatusDTO> {
    return this.migrateService.updateLabManager(id, version);
  }

  @Get(':id/lab-manager/status')
  async getContainersStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.aggregateService.getLabManagerStatus(id);
  }

  @Get(':id/lab-manager/starting/error')
  async getStartingError(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabManagerErrorLogs> {
    return this.aggregateService.getStartingError(id);
  }

  @Get('lab-manager/recommended-version')
  getLabManagerRecommendedVersion(): { labManagerRecommendedVersion: string } {
    return {
      labManagerRecommendedVersion: this.aggregateService.getLabManagerRecommendedVersion(),
    };
  }

  @Post(':id/lab-manager/stop-current-task')
  public stopCurrentTask(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.stopCurrentTask(id);
  }

  /////////////////////////// LAB MANAGER - INITIALIZATION ///////////////////////////

  @Post(':id/lab-manager/init-all')
  async initAll(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.initAll(id);
  }

  @Post(':id/lab-manager/configure-lab-manager')
  async configureLabManager(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.configureLabManager(id);
  }

  @Post(':id/lab-manager/pull-biota-db')
  async pullBiotaDb(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() options: CnManagerLabPullBiotaOptions
  ): Promise<void> {
    return this.aggregateService.pullBiota(id, options);
  }

  @Post(':id/lab-manager/clean')
  cleanLabManager(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() options: CnLabManagerCleanOptions
  ): Promise<void> {
    return this.aggregateService.cleanLabManager(id, options);
  }

  /////////////////////////// LAB MANAGER - CONFIGURATION ///////////////////////////

  @Get(':id/lab-manager/config')
  async getConfig(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabConfigDTO> {
    return await this.aggregateService.getLabManagerConfig(id);
  }

  /////////////////////////// LAB MANAGER - DOCKER COMPOSE  ///////////////////////////

  @Get(':id/lab-manager/docker-compose/list')
  listAllComposes(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabManagerComposeList> {
    return this.aggregateService.getAllComposes(id);
  }

  @Get(':id/lab-manager/docker-compose/:brickName/:uniqueName/:env/services')
  listServices(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('brickName') brickName: string,
    @Param('uniqueName') uniqueName: string,
    @Param('env', new BlParseEnumPipe(CnLabManagerComposeEnv)) env: CnLabManagerComposeEnv
  ): Promise<CnLabManagerDockerInspect[]> {
    return this.aggregateService.listServices(id, { brickName, uniqueName, env });
  }

  @Put(':id/lab-manager/docker-compose/:brickName/:uniqueName/:env/services/:serviceName/start')
  startComposeService(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('brickName') brickName: string,
    @Param('uniqueName') uniqueName: string,
    @Param('env', new BlParseEnumPipe(CnLabManagerComposeEnv)) env: CnLabManagerComposeEnv,
    @Param('serviceName') serviceName: string
  ): Promise<void> {
    return this.aggregateService.startComposeService(id, { brickName, uniqueName, env }, [serviceName]);
  }

  @Post(':id/lab-manager/docker-compose/:brickName/:uniqueName/:env/up-services')
  async upServices(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('brickName') brickName: string,
    @Param('uniqueName') uniqueName: string,
    @Param('env', new BlParseEnumPipe(CnLabManagerComposeEnv)) env: CnLabManagerComposeEnv,
    @Body() options: CnLabManagerComposeUpOptions
  ): Promise<void> {
    return await this.aggregateService.upServices(id, { brickName, uniqueName, env }, options);
  }

  @Post(':id/lab-manager/docker-compose/:brickName/:uniqueName/:env/restart-services')
  restartServices(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('brickName') brickName: string,
    @Param('uniqueName') uniqueName: string,
    @Param('env', new BlParseEnumPipe(CnLabManagerComposeEnv)) env: CnLabManagerComposeEnv,
    @Body() options: CnManagerLabComposeRestartOptions
  ): Promise<void> {
    return this.aggregateService.restartServices(id, { brickName, uniqueName, env }, options);
  }

  @Post(':id/lab-manager/docker-compose/:brickName/:uniqueName/:env/stop-services')
  stopServices(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('brickName') brickName: string,
    @Param('uniqueName') uniqueName: string,
    @Param('env', new BlParseEnumPipe(CnLabManagerComposeEnv)) env: CnLabManagerComposeEnv
  ): Promise<void> {
    return this.aggregateService.stopServices(id, { brickName, uniqueName, env });
  }

  @Post(':id/lab-manager/docker-compose/:brickName/:uniqueName/:env/delete-services')
  deleteServices(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('brickName') brickName: string,
    @Param('uniqueName') uniqueName: string,
    @Param('env', new BlParseEnumPipe(CnLabManagerComposeEnv)) env: CnLabManagerComposeEnv
  ): Promise<void> {
    return this.aggregateService.deleteServices(id, { brickName, uniqueName, env });
  }

  @Post(':id/lab-manager/docker-compose/:brickName/:uniqueName/:env/pull-services')
  pullServices(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('brickName') brickName: string,
    @Param('uniqueName') uniqueName: string,
    @Param('env', new BlParseEnumPipe(CnLabManagerComposeEnv)) env: CnLabManagerComposeEnv
  ): Promise<void> {
    return this.aggregateService.pullServices(id, { brickName, uniqueName, env });
  }

  @Get(':id/lab-manager/docker-compose/:brickName/:uniqueName/:env/content')
  getComposeContent(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('brickName') brickName: string,
    @Param('uniqueName') uniqueName: string,
    @Param('env', new BlParseEnumPipe(CnLabManagerComposeEnv)) env: CnLabManagerComposeEnv
  ): Promise<{ content: string }> {
    return this.aggregateService
      .getComposeContent(id, { brickName, uniqueName, env })
      .then((content) => ({ content }));
  }

  @Delete(':id/lab-manager/docker-compose/:brickName/:uniqueName/:env/unregister')
  unregisterSubCompose(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('brickName') brickName: string,
    @Param('uniqueName') uniqueName: string,
    @Param('env', new BlParseEnumPipe(CnLabManagerComposeEnv)) env: CnLabManagerComposeEnv
  ): Promise<void> {
    return this.aggregateService.unregisterSubCompose(id, { brickName, uniqueName, env });
  }

  /////////////////////////// LAB MANAGER - CONTAINERS ///////////////////////////

  @Get(':id/lab-manager/containers/:containerName')
  async getContainerDetails(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('containerName') containerName: string
  ): Promise<CnLabManagerDockerPsFull> {
    return await this.aggregateService.getContainerDetails(id, containerName);
  }

  @Get(':id/lab-manager/containers/:containerName/size')
  async getContainerSize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('containerName') containerName: string
  ): Promise<CnLabManagerContainerSize> {
    return await this.aggregateService.getContainerSize(id, containerName);
  }

  @Put(':id/lab-manager/containers/:containerName/stop')
  async stopContainer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('containerName') containerName: string
  ): Promise<void> {
    return await this.aggregateService.stopContainer(id, containerName);
  }

  @Put(':id/lab-manager/containers/:containerName/delete')
  async deleteContainer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('containerName') containerName: string
  ): Promise<void> {
    return await this.aggregateService.deleteContainer(id, containerName);
  }

  @Get(':id/lab-manager/containers/:containerName/logs')
  async getLogs(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('containerName') containerName: string
  ): Promise<CnLabManagerDockerLogs> {
    return await this.aggregateService.getLogs(id, containerName);
  }

  @Get(':id/lab-manager/containers/:containerName/logs/error')
  async getErrorLogs(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('containerName') containerName: string
  ): Promise<CnLabManagerDockerLogs> {
    return await this.aggregateService.getErrorLogs(id, containerName);
  }

  @Get(':id/lab-manager/containers/:containerName/logs/export')
  async exportLogs(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('containerName') containerName: string
  ): Promise<StreamableFile> {
    const fileContent = await this.aggregateService.exportLogs(id, containerName);
    return BlResponseHelper.streamableFileFromString(fileContent);
  }

  /////////////////////////// LAB MANAGER - ADMINER ///////////////////////////

  @Put(':id/lab-manager/adminer/start')
  async startAdminer(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.startAdminer(id);
  }

  @Put(':id/lab-manager/adminer/stop')
  async stopAdminer(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.stopAdminer(id);
  }

  @Get(':id/lab-manager/adminer/info')
  async getAdminerInfo(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabManagerAdminerInfo> {
    return await this.aggregateService.getAdminerInfo(id);
  }

  //////////////////////////// BACKUP ////////////////////////////////
  @Post(':id/backup/prod')
  async backupProd(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabBackupHistory[]> {
    return await this.aggregateService.createProdBackup(id);
  }

  @Post(':id/backup/stop-current')
  async stopCurrentBackup(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabBackupHistory[]> {
    return await this.aggregateService.stopCurrentBackup(id);
  }

  @Post(':id/backup/sync')
  async syncBackupHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.aggregateService.syncBackupHistory(id);
  }

  @Get(':id/backup/statuses')
  async getBackupsStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabBackupStatusDTO[]> {
    return await this.aggregateService.getBackupsStatus(id);
  }

  @Get(':id/backup-history')
  public getLabBackupHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnLabBackupHistory>> {
    return this.aggregateService.getLabBackupHistory(id, page, size);
  }

  @Get(':id/backup/statuses/admin')
  public getBackupStatusAdmin(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<CnLabCheckBackupSizeDTO[]> {
    return this.aggregateService.getBackupStatusAdmin(id);
  }

  @Delete(':id/backup')
  public deleteLabBackup(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.deleteLabBackups(id);
  }

  @Post(':id/backup-history/:backupHistoryId/restore')
  public async restoreBackup(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('backupHistoryId', new ParseUUIDPipe()) backupHistoryId: string,
    @Body() restoreBackupDTO: CnLabManagerRestoreBackupConfigDTO
  ): Promise<CnLabDto> {
    const lab = await this.aggregateService.restoreBackup(id, backupHistoryId, restoreBackupDTO);
    return new CnLabDto(lab);
  }

  /////////////////////////// SERVER //////////////////////////////
  @Get(':id/server/info')
  async getServerInfo(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnCpCompleteInfo> {
    return await this.aggregateService.getServerCompleteInfo(id);
  }

  @Post(':id/server/init')
  async init(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabStatusDTO> {
    return await this.aggregateService.initServer(id);
  }

  @Post(':id/server/create')
  async createServer(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabStatusDTO> {
    return await this.aggregateService.createServer(id);
  }

  @Post(':id/server/configure')
  async configureServer(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabStatusDTO> {
    return await this.aggregateService.configureServer(id);
  }

  @Delete(':id/server')
  async deleteServerInstance(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.aggregateService.deleteServerInstance(id);
  }

  @Put(':id/server/task/stop')
  async stopCurrentTaskServer(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabStatusDTO> {
    return await this.aggregateService.stopCurrentServerTask(id);
  }

  /////////////////////////// STATUS RULES //////////////////////////////

  @Post(':id/green-options')
  async createGreenOption(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() greenOption: CnLabGreenOptionFormDto
  ): Promise<CnLabGreenOption> {
    return await this.aggregateService.createGreenOption(id, greenOption);
  }

  @Put('green-options/:ruleId')
  async updateGreenOption(
    @Param('ruleId', new ParseUUIDPipe()) ruleId: string,
    @Body() greenOption: CnLabGreenOptionFormDto
  ): Promise<CnLabGreenOption> {
    return await this.aggregateService.updateGreenOption(ruleId, greenOption);
  }

  @Delete('green-options/:ruleId')
  async deleteGreenOption(@Param('ruleId', new ParseUUIDPipe()) ruleId: string): Promise<void> {
    return await this.aggregateService.deleteGreenOption(ruleId);
  }

  @Get(':id/green-options')
  async getGreenOptions(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabGreenOption[]> {
    return await this.aggregateService.getGreenOptions(id);
  }

  /////////////////////////// FREE LAB //////////////////////////////

  @Post('free-lab/current')
  async createFreeLabForCurrentUser(): Promise<CnLabDto> {
    const lab = await this.labFreeAggregateService.createFreeLabCurrentUser();
    return new CnLabDto(lab);
  }

  @Post('free-lab')
  async createFreeLab(
    @Body(new BlParsePipe(CnLabFreeCreateDto)) request: CnLabFreeCreateDto
  ): Promise<CnLabDto> {
    const lab = await this.labFreeAggregateService.createFreeLab(request);
    return new CnLabDto(lab);
  }

  @Get('free-lab/current')
  async getCurrentUserFreeLab(): Promise<CnLabFreeGetDto> {
    return await this.labFreeAggregateService.findFreeLabUsageForCurrentUser();
  }

  @Get('free-lab/user/:userId')
  async getUserFreeLabByUser(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnLabFreeGetDto> {
    return await this.labFreeAggregateService.findFreeLabUsageForUserAndCheck(userId);
  }

  @Get('free-lab/lab/:labId')
  async getUserFreeLabByLab(@Param('labId', new ParseUUIDPipe()) userId: string): Promise<CnLabFreeGetDto> {
    return await this.labFreeAggregateService.findFreeLabUsageForLabAndCheck(userId);
  }

  @Put('free-lab/:id')
  async updateFreeLab(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new BlParsePipe(CnLabFreeUpdateDto)) updateDto: CnLabFreeUpdateDto
  ): Promise<CnLabFreeGetDto> {
    return await this.labFreeAggregateService.updateFreeLab(id, updateDto);
  }

  @Delete('free-lab/:id')
  async deleteFreeLab(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabFreeGetDto> {
    return await this.labFreeAggregateService.deleteFreeLab(id);
  }

  /////////////////////////// KPI  //////////////////////////////

  @Post(':id/stats/running')
  async getLabRunningStats(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new BlParsePipe(CnLabStatsRequestDTO)) request: CnLabStatsRequestDTO
  ): Promise<CnLabStatsRunningResponseDTO> {
    return await this.aggregateService.getLabRunningStats(id, request);
  }

  @Post(':id/stats/storage')
  async getLabStorageStats(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new BlParsePipe(CnLabStatsRequestDTO)) request: CnLabStatsRequestDTO
  ): Promise<CnLabStatsStorageResponseDTO> {
    return await this.aggregateService.getLabStorageStats(id, request);
  }

  /////////////////////////// DESKTOP //////////////////////////////

  @Post(':id/desktop/generate-config')
  async generateDesktopConfig(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() config: CnLabDesktopGenerateConfig,
    @Res() response: Response
  ): Promise<any> {
    const result = await this.aggregateService.generateDesktopConfig(id, config);
    BlResponseHelper.setFileResponseFromStr(
      response,
      JSON.stringify(result, null, 4),
      'lab-manager-config.json',
      'application/json'
    );
  }

  @Get(':id/desktop/run-lab-manager')
  async getDesktopRunLabManagerCommand(@Param('id', new ParseUUIDPipe()) id: string): Promise<{
    command: string;
  }> {
    return { command: await this.aggregateService.getDesktopRunLabManagerCommand(id) };
  }

  @Post('desktop')
  async createDesktop(
    @Body(new BlParsePipe(CnLabCreateDesktopDTO)) createLab: CnLabCreateDesktopDTO
  ): Promise<CnLabDto> {
    const lab = await this.aggregateService.createDesktop(createLab);
    return new CnLabDto(lab);
  }

  @Put(':id/desktop')
  async updateDesktopLab(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new BlParsePipe(CnLabCreateDesktopDTO)) labDto: CnLabCreateDesktopDTO
  ): Promise<CnLabDto> {
    const lab = await this.aggregateService.updateDesktopLab(id, labDto);
    return new CnLabDto(lab);
  }

  @Delete(':id/desktop')
  async deleteDesktopLab(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.aggregateService.deleteDesktopLab(id);
  }

  /////////////////////////// ADMIN ROUTE //////////////////////////////
  @Post('admin')
  async createAdmin(
    @Body(new BlParsePipe(CnLabCreateAdminDTO)) createLab: CnLabCreateAdminDTO
  ): Promise<CnLabWithSpaceDto> {
    const lab = await this.aggregateService.createAdmin(createLab);
    return new CnLabWithSpaceDto(lab);
  }

  // use the DTO to get the apiKey (which is excluded)
  @Put('admin')
  async updateAdmin(
    @Body(new BlParsePipe(CnLabUpdateAdminDTO)) labDto: CnLabUpdateAdminDTO
  ): Promise<CnLabWithSpaceDto> {
    const lab = await this.aggregateService.updateAdmin(labDto);
    return new CnLabWithSpaceDto(lab);
  }

  @Get('admin/:id')
  async findByIdAdmin(@Param('id', ParseUUIDPipe) id: string): Promise<CnLabAdminDto> {
    const lab = await this.aggregateService.findByIdAdmin(id);
    return new CnLabAdminDto(lab);
  }

  @Delete('admin/:id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.aggregateService.delete(id);
  }

  @Post('admin/search')
  async searchAll(
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnLabWithSpaceDto>> {
    // use a DTO to return all the field including the apiKey
    const labs = await this.aggregateService.searchAll(searchParam, page, size);
    return BlDtoHelper.pageToDto(CnLabWithSpaceDto, labs);
  }

  @Post('migrate-dev-api-key')
  async migrateLab(): Promise<void> {
    return this.aggregateService.createGlabDevApiKey();
  }
}
