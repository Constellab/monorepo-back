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
  StreamableFile
} from '@nestjs/common';
import { CnLabInstance } from './cn-lab-instance.entity';
import { CnLabInstanceAggregateService } from './cn-lab-instance-aggregate.service';
import { CnLabInstanceStatusHistory } from './status/cn-lab-instance-status-history.entity';
import { BlDtoHelper, BlParseEnumPipe, BlParsePipe, BlResponseHelper, BlSearchParams } from '@monorepo/back-core-lib';
import { ClPageI } from '@monorepo/core-lib';
import {
  CnLabCloudCreateDTO,
  CnLabCodelabDTO,
  CnLabFindOneDto,
  CnLabInstanceAdminDto,
  CnLabInstanceConfigDTO,
  CnLabInstanceCreateAdminDTO,
  CnLabInstanceCreateDesktopDTO,
  CnLabInstanceDesktopConfig,
  CnLabInstanceDto,
  CnLabInstanceStatusDTO,
  CnLabInstanceUpdateAdminDTO,
  CnLabInstanceWithSpaceDto,
  CnLabServerInfoDTO,
  CnRequestLabInstance
} from './cn-lab-instance.dto';
import {
  CnLabManagerComposeUpOptions,
  CnLabManagerDockerPs,
  CnLabManagerDockerPsFull,
  CnLabManagerRestoreBackupConfigDTO,
  CnManagerLabComposeRestartOptions,
  CnManagerLabPullBiotaOptions
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';
import { CnLabInstanceUser, CnLabInstanceUserRole } from './user/cn-lab-instance-user.entity';
import { CnCpCompleteInfo } from './server/cn-cloud-provider.class';
import { Response } from 'express';
import * as AdmZip from 'adm-zip';
import { CnLabGreenOption } from './green-option/cn-lab-green-option.entity';
import { CnLabGreenOptionFormDto } from './green-option/cn-lab-green-option.dto';
import { CnLabInstanceStatusRunRequest, CnLabInstanceStatusRunResponse } from './status/cn-lab-instance-status.dto';
import { CnLabFreeCreateDto, CnLabFreeGetDto, CnLabFreeUpdateDto } from './lab-free/cn-lab-free.dto';
import { CnLabFreeAggregateService } from './lab-free/cn-lab-free-aggregate.service';
import { CnLabBackupHistory } from './backup/cn-lab-backup-history.entity';
import { CnLabBackupStatusDTO, CnLabCheckBackupSizeDTO } from './backup/cn-lab-backup.dto';


@Controller('lab-instances')
export class CnLabInstancesController {

  constructor(private aggregateService: CnLabInstanceAggregateService,
              private labFreeAggregateService: CnLabFreeAggregateService) {
  }


  @Post('cloud')
  async createCloudLab(@Body(new BlParsePipe(CnLabCloudCreateDTO)) createLabInstance: CnLabCloudCreateDTO):
    Promise<CnLabInstanceDto> {
    const labInstance = await this.aggregateService.createCloudLab(createLabInstance);
    return BlDtoHelper.toDto(CnLabInstanceDto, labInstance);
  }


  @Put(':id/name/:name')
  async updateLabName(@Param('id', new ParseUUIDPipe()) id: string,
                      @Param('name') name: string): Promise<CnLabInstanceDto> {
    const labInstance = await this.aggregateService.updateLabName(id, name);
    return BlDtoHelper.toDto(CnLabInstanceDto, labInstance);
  }


  @Post('request-lab-instance')
  async requestLabInstance(@Body() request: CnRequestLabInstance): Promise<void> {
    await this.aggregateService.requestLabInstance(request);
  }

  /**
   * return the list of running lab instance shared with the current user
   */
  @Get('current')
  public getCurrentLabInstances(@Query('page', ParseIntPipe) page: number,
                                @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnLabInstance>> {
    return this.aggregateService.getCurrentLabInstances(page, size);
  }

  /**
   * return the list of running lab instance created by the current user
   */
  @Get('current-running')
  public getCurrentRunningLabInstances(): Promise<CnLabInstance[]> {
    return this.aggregateService.getCurrentRunningLabInstances();
  }

  @Get('current-space')
  async getByCurrentSpace(@Query('page', ParseIntPipe) page: number,
                          @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnLabInstance>> {
    return await this.aggregateService.getByCurrentSpace(page, size);
  }

  @Post('current-space/search')
  async searchInCurrentSpace(@Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                             @Query('page', ParseIntPipe) page: number,
                             @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnLabInstance>> {
    return await this.aggregateService.searchInCurrentSpace(searchParam, page, size);
  }

  /**
   * Get the lab instance with user role for this lab
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
   * start a lab instance
   */
  @Put(':id/start')
  public startInstance(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstance> {
    return this.aggregateService.startInstance(id);
  }

  /**
   * stop a lab instance
   */
  @Put(':id/stop')
  public stopInstance(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstance> {
    return this.aggregateService.stopInstance(id);
  }

  /**
   * Route to update the dockerlab repository
   */
  @Put(':id/dockerlab/update')
  public updateDockerlabRepository(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusDTO> {
    return this.aggregateService.updateDockerlab(id);
  }

  /**
   * Get the url to log into the lab
   * return the labInstance
   */
  @Get(':id/login')
  public async login(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    const result = await this.aggregateService.login(id);
    // redirect to lab auto login page
    return { url: `${result.labInstance.glabUrl}/${CnLabInstance.CORE_API_ROUTE}/login-temp-access/${result.token}` };
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
  public getLabInstanceConfig(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabConfig> {
    return this.aggregateService.getConfig(id);
  }

  @Put(':id/config')
  async updateConfig(@Param('id', new ParseUUIDPipe()) id: string,
                     @Body() config: CnLabInstanceConfigDTO): Promise<void> {
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
  getStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusDTO> {
    return this.aggregateService.getLabStatus(id);
  }

  /**
   * return the history of the status
   */
  @Post(':id/status/history')
  public getStatusHistoryDatasource(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number,
    @Body(new BlParsePipe(BlSearchParams)) searchParams: BlSearchParams): Promise<ClPageI<CnLabInstanceStatusHistory>> {
    return this.aggregateService.getLabStatusHistory(id, page, size, searchParams);
  }


  /**
   * stop a lab instance
   */
  @Put(':id/status/refresh')
  public refreshStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusDTO> {
    return this.aggregateService.checkAndRefreshStatus(id);
  }

  //////////////////////////// USERS ////////////////////////////////

  @Post(':id/user/:userId/:role')
  public addUserToLab(@Param('id', new ParseUUIDPipe()) id: string,
                      @Param('userId', new ParseUUIDPipe()) userId: string,
                      @Param('role', new BlParseEnumPipe(CnLabInstanceUserRole)) role: CnLabInstanceUserRole): Promise<CnLabInstanceUser> {
    return this.aggregateService.addUserToLab(id, userId, role);
  }

  @Put(':id/user/:userId/:role')
  public updateUserLabRole(@Param('id', new ParseUUIDPipe()) id: string,
                           @Param('userId', new ParseUUIDPipe()) userId: string,
                           @Param('role', new BlParseEnumPipe(CnLabInstanceUserRole)) role: CnLabInstanceUserRole)
    : Promise<CnLabInstanceUser> {
    return this.aggregateService.updateUserLabRole(id, userId, role);
  }

  @Delete(':id/user/:userId')
  public removeUserFromLab(@Param('id', new ParseUUIDPipe()) id: string,
                           @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.aggregateService.removeUserFromLab(id, userId);
  }


  @Get(':id/user')
  public getLabInstanceSharedUsers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceUser[]> {
    return this.aggregateService.getLabInstanceSharedUsers(id);
  }

  //////////////////////////// LAB MANAGER ////////////////////////////////

  /**
   * Route to update the docker image of the lab manager
   */
  @Put(':id/lab-manager/update/:version')
  public updateLabManager(@Param('id', new ParseUUIDPipe()) id: string,
                          @Param('version') version: string): Promise<CnLabInstanceStatusDTO> {
    return this.aggregateService.updateLabManager(id, version);
  }

  @Get(':id/lab-manager/status')
  async getContainersStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.aggregateService.getLabManagerStatus(id);
  }

  @Get(':id/lab-manager/containers')
  async listContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabManagerDockerPs[]> {
    return await this.aggregateService.listContainers(id);
  }

  @Get(':id/lab-manager/containers/:containerName')
  async getContainerDetails(@Param('id', new ParseUUIDPipe()) id: string,
                            @Param('containerName') containerName: string): Promise<CnLabManagerDockerPsFull> {
    return await this.aggregateService.getContainerDetails(id, containerName);
  }

  @Put(':id/lab-manager/containers/:serviceName/start')
  async startContainer(@Param('id', new ParseUUIDPipe()) id: string,
                       @Param('serviceName') serviceName: string): Promise<void> {
    return await this.aggregateService.startComposeContainer(id, serviceName);
  }

  @Put(':id/lab-manager/containers/:containerName/stop')
  async stopContainer(@Param('id', new ParseUUIDPipe()) id: string,
                      @Param('containerName') containerName: string): Promise<boolean> {
    return await this.aggregateService.stopContainer(id, containerName);
  }

  @Put(':id/lab-manager/containers/:containerName/delete')
  async deleteContainer(@Param('id', new ParseUUIDPipe()) id: string,
                        @Param('containerName') containerName: string): Promise<boolean> {
    return await this.aggregateService.deleteContainer(id, containerName);
  }

  @Get(':id/lab-manager/containers/:containerName/logs')
  async getLogs(@Param('id', new ParseUUIDPipe()) id: string, @Param('containerName') containerName: string): Promise<string> {
    return await this.aggregateService.getLogs(id, containerName);
  }

  @Get(':id/lab-manager/containers/:containerName/logs/export')
  async exportLogs(@Param('id', new ParseUUIDPipe()) id: string, @Param('containerName') containerName: string): Promise<StreamableFile> {
    const fileContent = await this.aggregateService.exportLogs(id, containerName);
    return BlResponseHelper.fileResponseFromString(fileContent);
  }

  @Post(':id/lab-manager/init-all')
  async initAll(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.initAll(id);
  }

  @Post(':id/lab-manager/configure-lab-manager')
  async configureLabManager(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.configureLabManager(id);
  }

  @Post(':id/lab-manager/up-containers')
  async upContainers(@Param('id', new ParseUUIDPipe()) id: string,
                     @Body() options: CnLabManagerComposeUpOptions): Promise<void> {
    return await this.aggregateService.upContainers(id, options);
  }

  @Post(':id/lab-manager/restart-containers')
  async restartContainers(@Param('id', new ParseUUIDPipe()) id: string,
                          @Body() options: CnManagerLabComposeRestartOptions): Promise<void> {
    return await this.aggregateService.restartContainers(id, options);
  }

  @Post(':id/lab-manager/stop-containers')
  async stopContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.stopContainers(id);
  }

  @Post(':id/lab-manager/delete-containers')
  async downContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.deleteContainers(id);
  }

  @Post(':id/lab-manager/pull-containers')
  async pullContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.pullContainers(id);
  }

  @Post(':id/lab-manager/pull-biota-db')
  async pullBiotaDb(@Param('id', new ParseUUIDPipe()) id: string,
                    @Body() options: CnManagerLabPullBiotaOptions): Promise<void> {
    return this.aggregateService.pullBiota(id, options);
  }

  @Post(':id/lab-manager/stop-current-task')
  public stopCurrentTask(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.stopCurrentTask(id);
  }

  @Post(':id/lab-manager/system-prune')
  public systemPrune(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.systemPrune(id);
  }

  @Get(':id/lab-manager/config')
  async getConfig(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceConfigDTO> {
    return await this.aggregateService.getLabManagerConfig(id);
  }

  @Put(':id/lab-manager/adminer/start')
  async startAdminer(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.aggregateService.startAdminer(id);
  }

  @Put(':id/lab-manager/adminer/stop')
  async stopAdminer(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.aggregateService.stopAdminer(id);
  }

  @Get('lab-manager/recommended-version')
  getLabManagerRecommendedVersion(): { labManagerRecommendedVersion: string } {
    return {
      labManagerRecommendedVersion: this.aggregateService.getLabManagerRecommendedVersion()
    };
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
  public getLabBackupHistory(@Param('id', new ParseUUIDPipe()) id: string,
                             @Query('page', ParseIntPipe) page: number,
                             @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnLabBackupHistory>> {
    return this.aggregateService.getLabBackupHistory(id, page, size);
  }

  @Get(':id/backup/statuses/admin')
  public getBackupStatusAdmin(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabCheckBackupSizeDTO[]> {
    return this.aggregateService.getBackupStatusAdmin(id);
  }

  @Delete(':id/backup')
  public deleteLabBackup(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.deleteLabBackups(id);
  }

  @Post(':id/backup-history/:backupHistoryId/restore')
  public restoreBackup(@Param('id', new ParseUUIDPipe()) id: string,
                       @Param('backupHistoryId', new ParseUUIDPipe()) backupHistoryId: string,
                       @Body() restoreBackupDTO: CnLabManagerRestoreBackupConfigDTO): Promise<CnLabInstance> {
    return this.aggregateService.restoreBackup(id, backupHistoryId, restoreBackupDTO);
  }

  /////////////////////////// SERVER //////////////////////////////
  @Get(':id/server/info')
  async getServerInfo(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnCpCompleteInfo> {
    return await this.aggregateService.getServerCompleteInfo(id);
  }

  @Post(':id/server/init')
  async init(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusDTO> {
    return await this.aggregateService.initServer(id);
  }

  @Post(':id/server/create')
  async createServer(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusDTO> {
    return await this.aggregateService.createServer(id);
  }

  @Post(':id/server/configure')
  async configureServer(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusDTO> {
    return await this.aggregateService.configureServer(id);
  }

  @Delete(':id/server')
  async deleteServerInstance(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.aggregateService.deleteServerInstance(id);
  }

  @Put(':id/server/task/stop')
  async stopCurrentTaskServer(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusDTO> {
    return await this.aggregateService.stopCurrentServerTask(id);
  }

  /////////////////////////// STATUS RULES //////////////////////////////

  @Post(':id/green-options')
  async createGreenOption(@Param('id', new ParseUUIDPipe()) id: string,
                          @Body() greenOption: CnLabGreenOptionFormDto): Promise<CnLabGreenOption> {
    return await this.aggregateService.createGreenOption(id, greenOption);
  }

  @Put('green-options/:ruleId')
  async updateGreenOption(@Param('ruleId', new ParseUUIDPipe()) ruleId: string,
                          @Body() greenOption: CnLabGreenOptionFormDto): Promise<CnLabGreenOption> {
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
  async createFreeLabForCurrentUser(): Promise<CnLabInstance> {
    return await this.labFreeAggregateService.createFreeLabInstanceCurrentUser();
  }

  @Post('free-lab')
  async createFreeLab(@Body(new BlParsePipe(CnLabFreeCreateDto)) request: CnLabFreeCreateDto): Promise<CnLabInstanceAdminDto> {
    const labInstance = await this.labFreeAggregateService.createFreeLab(request);
    return BlDtoHelper.toDto(CnLabInstanceAdminDto, labInstance);
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
    return await this.labFreeAggregateService.findFreeLabUsageForLabInstanceAndCheck(userId);
  }

  @Put('free-lab/:id')
  async updateFreeLab(@Param('id', new ParseUUIDPipe()) id: string,
                      @Body(new BlParsePipe(CnLabFreeUpdateDto)) updateDto: CnLabFreeUpdateDto): Promise<CnLabFreeGetDto> {
    return await this.labFreeAggregateService.updateFreeLab(id, updateDto);
  }

  @Delete('free-lab/:id')
  async deleteFreeLab(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabFreeGetDto> {
    return await this.labFreeAggregateService.deleteFreeLab(id);
  }

  /////////////////////////// KPI  //////////////////////////////

  @Post(':id/kpi/running')
  async getLabInstanceRunningKpis(@Param('id', new ParseUUIDPipe()) id: string,
                                  @Body() request: CnLabInstanceStatusRunRequest): Promise<CnLabInstanceStatusRunResponse> {
    return await this.aggregateService.getLabInstanceRunningKpis(id, request);
  }

  /////////////////////////// DESKTOP //////////////////////////////
  @Post('desktop')
  async createDesktop(@Body(new BlParsePipe(CnLabInstanceCreateDesktopDTO)) createLabInstance: CnLabInstanceCreateDesktopDTO):
    Promise<CnLabInstanceDto> {
    const labInstance = await this.aggregateService.createDesktop(createLabInstance);
    return BlDtoHelper.toDto(CnLabInstanceDto, labInstance);
  }


  @Post(':id/desktop/generate-config')
  async generateDesktopConfig(@Param('id', new ParseUUIDPipe()) id: string,
                              @Body() desktopConfig: CnLabInstanceDesktopConfig,
                              @Res() response: Response): Promise<any> {
    const result = await this.aggregateService.generateDesktopConfig(id, desktopConfig);

    // create a zip file
    const zip = new AdmZip();
    zip.addFile('docker-compose.yml', Buffer.from(result.dockerCompose, 'utf8'));
    zip.addFile('config.json', Buffer.from(JSON.stringify(result.config, null, 4), 'utf8'));
    zip.addFile(result.exeFile.name, result.exeFile.buffer);
    response.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename=constellab-desktop.zip'
    });
    const data = zip.toBuffer();
    response.send(data);
  }

  @Put(':id/desktop')
  async updateDesktopLab(@Param('id', new ParseUUIDPipe()) id: string,
                         @Body(new BlParsePipe(CnLabInstanceCreateDesktopDTO)) labInstanceDto: CnLabInstanceCreateDesktopDTO):
    Promise<CnLabInstanceDto> {
    const labInstance = await this.aggregateService.updateDesktopLab(id, labInstanceDto);
    return BlDtoHelper.toDto(CnLabInstanceDto, labInstance);
  }

  /////////////////////////// ADMIN ROUTE //////////////////////////////²²²
  @Post('admin')
  async createAdmin(@Body(new BlParsePipe(CnLabInstanceCreateAdminDTO)) createLabInstance: CnLabInstanceCreateAdminDTO):
    Promise<CnLabInstanceWithSpaceDto> {
    const labInstance = await this.aggregateService.createAdmin(createLabInstance);
    return BlDtoHelper.toDto(CnLabInstanceWithSpaceDto, labInstance);
  }

  // use the DTO to get the apiKey (which is excluded)
  @Put('admin')
  async updateAdmin(@Body(new BlParsePipe(CnLabInstanceUpdateAdminDTO)) labInstanceDto: CnLabInstanceUpdateAdminDTO):
    Promise<CnLabInstanceWithSpaceDto> {
    const labInstance = await this.aggregateService.updateAdmin(labInstanceDto);
    return BlDtoHelper.toDto(CnLabInstanceWithSpaceDto, labInstance);
  }

  @Get('admin/:id')
  async findByIdAdmin(@Param('id', ParseUUIDPipe) id: string): Promise<CnLabInstanceAdminDto> {
    const labInstance = await this.aggregateService.findByIdAdmin(id);
    return BlDtoHelper.toDto(CnLabInstanceAdminDto, labInstance);
  }

  @Delete('admin/:id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.aggregateService.delete(id);
  }

  @Post('admin/search')
  async searchAll(@Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                  @Query('page', ParseIntPipe) page: number,
                  @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnLabInstanceWithSpaceDto>> {
    // use a DTO to return all the field including the apiKey
    const labInstances = await this.aggregateService.searchAll(searchParam, page, size);
    return BlDtoHelper.pageToDto(CnLabInstanceWithSpaceDto, labInstances);
  }
}
