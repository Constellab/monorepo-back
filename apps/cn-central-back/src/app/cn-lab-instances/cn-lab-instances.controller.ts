import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query, Res} from '@nestjs/common';
import {CnLabInstance, CnLabInstanceBillingMode} from './cn-lab-instance.entity';
import {CnLabInstanceAggregateService} from './cn-lab-instance-aggregate.service';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {BlDtoHelper, BlParseEnumPipe, BlParsePipe, BlSearchParams} from '@monorepo/back-core-lib';
import {ClPageI} from '@monorepo/core-lib';
import {
  CnLabBackupOptionDTO,
  CnLabFindOneDto,
  CnLabInstanceAdminDto,
  CnLabInstanceConfigDTO,
  CnLabInstanceCreateAdminDTO,
  CnLabInstanceCreateDesktopDTO,
  CnLabInstanceDesktopConfig,
  CnLabInstanceDto,
  CnLabInstanceStatusDTO,
  CnLabInstanceUpdateAdminDTO,
  CnRequestLabInstance,
} from './cn-lab-instance.dto';
import {
  CnLabComposeRestartOptions,
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabDockerPsFull,
  CnLabPullBiotaOptions
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabInstanceUser, CnLabInstanceUserRole} from './user/cn-lab-instance-user.entity';
import {CnLabInstanceProject} from './project/cn-lab-instance-project.entity';
import {CnCpCompleteInfo} from './server/cn-cloud-provider.class';
import {Response} from 'express';
import * as AdmZip from 'adm-zip';
import {CnLabGreenOption} from './green-option/cn-lab-green-option.entity';
import {CnLabGreenOptionFormDto} from './green-option/cn-lab-green-option.dto';
import {CnLabInstanceStatusRunRequest, CnLabInstanceStatusRunResponse} from './status/cn-lab-instance-status.dto';
import {CnFreeTrialUpdateDto, CnLabFreeTrialGetDto} from './free-trial/cn-lab-free-trial.dto';
import {CnLabFreeTrialAggregateService} from './free-trial/cn-lab-free-trial-aggregate.service';
import {CnLabBackupHistory} from './backup/cn-lab-backup-history.entity';
import {CnCloudProviderOutscaleService} from './server/outscale/cn-cloud-provider-outscale.service';


@Controller('lab-instances')
export class CnLabInstancesController {

  constructor(private aggregateService: CnLabInstanceAggregateService,
              private labFreeTrialAggregateService: CnLabFreeTrialAggregateService,
              private cloudOutscale: CnCloudProviderOutscaleService) {
  }

  @Get('admin-test')
  async test(): Promise<any> {
    // return this.outscaleService.attachPublicIpToInstance('i-8f99c40c', 'eipalloc-de01b887')
    // return await this.outscaleService.createInstance('', '', '');
    // return this.outscaleService.createVolume(110);
    // return this.outscaleService.attachVolumeToInstance('i-35d98c93', 'vol-cd911e53');
    // return this.outscaleService.getVolume('vol-20fafd6a');
    // return this.outscaleService.stopInstance('i-35d98c93');
    // return this.outscaleService.startInstance('i-35d98c93');
    return this.cloudOutscale.createInstance({
      region: 'eu-west-2',
      billing: CnLabInstanceBillingMode.HOURLY,
      name: 'super-name',
      serverName: 'tinav4.c2r4p2'
    });
  }

  // @Get('admin-test/:id')
  // async testkk(@Param('id') id: string): Promise<any> {
  //   return await this.outscaleService.getVm(id);
  // }
  //
  // @Delete('admin-test/:id')
  // async testk(@Param('id') id: string): Promise<any> {
  //   return await this.outscaleService.deleteInstance(id);
  // }


  @Post('admin')
  async createAdmin(@Body(new BlParsePipe(CnLabInstanceCreateAdminDTO)) createLabInstance: CnLabInstanceCreateAdminDTO):
    Promise<CnLabInstanceAdminDto> {
    const labInstance = await this.aggregateService.createAdmin(createLabInstance);
    return BlDtoHelper.toDto(CnLabInstanceAdminDto, labInstance);
  }

  // use the DTO to get the apiKey (which is excluded)
  @Put('admin')
  async updateAdmin(@Body(new BlParsePipe(CnLabInstanceUpdateAdminDTO)) labInstanceDto: CnLabInstanceUpdateAdminDTO):
    Promise<CnLabInstanceAdminDto> {
    const labInstance = await this.aggregateService.updateAdmin(labInstanceDto);
    return BlDtoHelper.toDto(CnLabInstanceAdminDto, labInstance);
  }

  @Post('desktop')
  async createDesktop(@Body(new BlParsePipe(CnLabInstanceCreateDesktopDTO)) createLabInstance: CnLabInstanceCreateDesktopDTO):
    Promise<CnLabInstanceDto> {
    const labInstance = await this.aggregateService.createDesktop(createLabInstance);
    return BlDtoHelper.toDto(CnLabInstanceDto, labInstance);
  }

  @Put()
  async update(@Body(new BlParsePipe(CnLabInstanceCreateDesktopDTO)) labInstanceDto: CnLabInstanceCreateDesktopDTO):
    Promise<CnLabInstanceDto> {
    const labInstance = await this.aggregateService.updateLab(labInstanceDto);
    return BlDtoHelper.toDto(CnLabInstanceDto, labInstance);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.aggregateService.delete(id);
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

  @Post('search')
  async searchAll(@Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                  @Query('page', ParseIntPipe) page: number,
                  @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnLabInstanceAdminDto>> {
    // use a DTO to return all the field including the apiKey
    const labInstances = await this.aggregateService.searchAll(searchParam, page, size);
    return BlDtoHelper.pageToDto(CnLabInstanceAdminDto, labInstances);
  }

  /**
   * Get the lab instance with user role for this lab
   * Keep this route after the current otherwise the current routes will not work
   */
  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabFindOneDto> {
    return await this.aggregateService.findByIdAndCheck(id);
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
    return {url: `${result.labInstance.glabUrl}/${CnLabInstance.CORE_API_ROUTE}/login-temp-access/${result.token}`};
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
  @Get(':id/status/history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusHistory[]> {
    return this.aggregateService.getStatusHistory(id);
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

  //////////////////////////// PROJECT ////////////////////////////////

  @Post(':id/project/:projectId')
  public addProject(@Param('id', new ParseUUIDPipe()) id: string,
                    @Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<CnLabInstanceProject> {
    return this.aggregateService.addProjectInLab(id, projectId);
  }

  @Delete(':id/project/:projectId')
  public removeProject(@Param('id', new ParseUUIDPipe()) id: string,
                       @Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<void> {
    return this.aggregateService.removeProjectInLab(id, projectId);
  }

  @Get(':id/project')
  public getProjects(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceProject[]> {
    return this.aggregateService.getLabInstanceProjects(id);
  }

  @Put(':id/project/:projectId/sync')
  public forceSync(@Param('id', new ParseUUIDPipe()) id: string,
                   @Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<void> {
    return this.aggregateService.forceProjectSyncInLab(id, projectId);
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
  async listContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabDockerPs[]> {
    return await this.aggregateService.listContainers(id);
  }

  @Get(':id/lab-manager/containers/:containerName')
  async getContainerDetails(@Param('id', new ParseUUIDPipe()) id: string,
                            @Param('containerName') containerName: string): Promise<CnLabDockerPsFull> {
    return await this.aggregateService.getContainerDetails(id, containerName);
  }

  @Get(':id/lab-manager/containers/:containerName/logs')
  async getLogs(@Param('id', new ParseUUIDPipe()) id: string, @Param('containerName') containerName: string): Promise<string> {
    return await this.aggregateService.getLogs(id, containerName);
  }

  @Post(':id/lab-manager/init-all')
  async initAll(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.initAll(id);
  }

  @Post(':id/lab-manager/up-containers')
  async upContainers(@Param('id', new ParseUUIDPipe()) id: string,
                     @Body() options: CnLabComposeUpOptions): Promise<void> {
    return await this.aggregateService.upContainers(id, options);
  }

  @Post(':id/lab-manager/restart-containers')
  async restartContainers(@Param('id', new ParseUUIDPipe()) id: string,
                          @Body() options: CnLabComposeRestartOptions): Promise<void> {
    return await this.aggregateService.restartContainers(id, options);
  }

  @Post(':id/lab-manager/down-containers')
  async downContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.downContainers(id);
  }

  @Post(':id/lab-manager/pull-containers')
  async pullContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.pullContainers(id);
  }

  @Post(':id/lab-manager/pull-biota-db')
  async pullBiotaDb(@Param('id', new ParseUUIDPipe()) id: string,
                    @Body() options: CnLabPullBiotaOptions): Promise<void> {
    return this.aggregateService.pullBiota(id, options);
  }

  @Post(':id/lab-manager/registry-login')
  async registryLogin(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.registryLogin(id);
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

  @Get(':id/backup-options')
  async getBackupOptions(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabBackupOptionDTO> {
    return await this.aggregateService.getLabBackupOptions(id);
  }

  @Get(':id/backup-history')
  public getLabBackupHistory(@Param('id', new ParseUUIDPipe()) id: string,
                             @Query('page', ParseIntPipe) page: number,
                             @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnLabBackupHistory>> {
    return this.aggregateService.getLabBackupHistory(id, page, size);
  }

  /////////////////////////// SERVER //////////////////////////////
  @Get(':id/server/info')
  async getServerInfo(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnCpCompleteInfo> {
    return await this.aggregateService.getServerInfo(id);
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

  /////////////////////////// FREE TRIAL //////////////////////////////

  @Post('free-trial/current')
  async createFreeTrialForCurrentUser(): Promise<CnLabInstance> {
    return await this.labFreeTrialAggregateService.createFreeTrialLabInstanceCurrentUser();
  }

  @Get('free-trial/current')
  async getCurrentUserFreeTrial(): Promise<CnLabFreeTrialGetDto> {
    return await this.labFreeTrialAggregateService.findFreeTrialUsageForCurrentUser();
  }

  @Get('free-trial/user/:userId')
  async getUserFreeTrialByUser(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnLabFreeTrialGetDto> {
    return await this.labFreeTrialAggregateService.findFreeTrialUsageForUserAndCheck(userId);
  }

  @Get('free-trial/lab/:labId')
  async getUserFreeTrialByLab(@Param('labId', new ParseUUIDPipe()) userId: string): Promise<CnLabFreeTrialGetDto> {
    return await this.labFreeTrialAggregateService.findFreeTrialUsageForLabInstanceAndCheck(userId);
  }

  @Put('free-trial/:id')
  async updateFreeTrial(@Param('id', new ParseUUIDPipe()) id: string,
                        @Body(new BlParsePipe(CnFreeTrialUpdateDto)) updateDto: CnFreeTrialUpdateDto): Promise<CnLabFreeTrialGetDto> {
    return await this.labFreeTrialAggregateService.updateFreeTrials(id, updateDto);
  }

  @Delete('free-trial/:id')
  async deleteFreeTrial(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabFreeTrialGetDto> {
    return await this.labFreeTrialAggregateService.deleteFreeTrial(id);
  }

  /////////////////////////// KPI  //////////////////////////////

  @Post(':id/kpi/running')
  async getLabInstanceRunningKpis(@Param('id', new ParseUUIDPipe()) id: string,
                                  @Body() request: CnLabInstanceStatusRunRequest): Promise<CnLabInstanceStatusRunResponse> {
    return await this.aggregateService.getLabInstanceRunningKpis(id, request);
  }

  /////////////////////////// DESKTOP //////////////////////////////
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
}
