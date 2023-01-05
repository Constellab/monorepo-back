import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstanceAggregateService} from './cn-lab-instance-aggregate.service';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {BlDtoHelper, BlParseEnumPipe, BlParsePipe, BlSearchParams} from '@monorepo/back-core-lib';
import {ClPageI} from '@monorepo/core-lib';
import {
  CnLabFindOneDto,
  CnLabInstanceAdminDto,
  CnLabInstanceConfigDTO,
  CnLabInstanceCreateDTO,
  CnLabInstanceStatusDTO,
} from './cn-lab-instance.dto';
import {
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabManagerStatus
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabInstanceUser, CnLabInstanceUserRole} from './user/cn-lab-instance-user.entity';
import {CnLabInstanceProject} from './project/cn-lab-instance-project.entity';
import {CnExternalLabBackup, CnExternalLabBackupHistory} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {CnCpCompleteInfo} from './cloud-provider/cn-cloud-provider-external.class';


@Controller('lab-instances')
export class CnLabInstancesController {

  constructor(private aggregateService: CnLabInstanceAggregateService) {
  }


  @Post()
  async create(@Body(new BlParsePipe(CnLabInstanceCreateDTO)) createLabInstance: CnLabInstanceCreateDTO): Promise<CnLabInstanceAdminDto> {
    const labInstance = await this.aggregateService.create(createLabInstance);
    return BlDtoHelper.toDto(CnLabInstanceAdminDto, labInstance);
  }

  // use the DTO to get the apiKey (which is excluded)
  @Put()
  async update(@Body(new BlParsePipe(CnLabInstanceCreateDTO)) labInstanceDto: CnLabInstanceCreateDTO): Promise<CnLabInstanceAdminDto> {
    const labInstance = await this.aggregateService.update(labInstanceDto);
    return BlDtoHelper.toDto(CnLabInstanceAdminDto, labInstance);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.aggregateService.delete(id);
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
   * Get the url to log into the lab
   * return the labInstance
   */
  @Get(':id/login')
  public async login(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    const result = await this.aggregateService.login(id);
    // redirect to lab auto login page
    return {url: result.labInstance.getGlabApiInfo().apiUrl + '/core-api/login-temp-access/' + result.token};
  }

  /**
   * Update the lab name
   */
  @Put(':id/name/:name')
  public updateName(@Param('id', new ParseUUIDPipe()) id: string, @Param('name') name: string): Promise<CnLabInstance> {
    return this.aggregateService.updateName(id, name);
  }

  /**
   * Check the lab status and returns settings if ok
   */
  @Get(':id/check-status')
  public checkStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.aggregateService.checkStatus(id);
  }

  /**
   * Check the lab status and returns settings if ok
   */
  @Get(':id/lab-config')
  public getLabInstanceConfig(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabConfig> {
    return this.aggregateService.getLabInstanceConfig(id);
  }

  //////////////////////////// STATUS ////////////////////////////////
  /**
   * return the history of the status
   */
  @Get(':id/status')
  getStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusDTO> {
    return this.aggregateService.getStatus(id);
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
    return this.aggregateService.refreshStatus(id);
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

  //////////////////////////// LAB MANAGER ////////////////////////////////

  @Get(':id/lab-manager/status')
  async getContainersStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabManagerStatus> {
    return this.aggregateService.getLabManagerStatus(id);
  }

  @Get(':id/lab-manager/containers')
  async listContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabDockerPs[]> {
    return await this.aggregateService.listContainers(id);
  }

  @Get(':id/lab-manager/:containerName/logs')
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
                          @Body() options: CnLabComposeUpOptions): Promise<void> {
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
  async pullBiotaDb(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.pullBiota(id);
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

  @Put(':id/lab-manager/config')
  async updateConfig(@Param('id', new ParseUUIDPipe()) id: string,
                     @Body() config: CnLabInstanceConfigDTO): Promise<void> {
    return await this.aggregateService.updateConfig(id, config);
  }

  @Get(':id/lab-manager/config')
  async getConfig(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceConfigDTO> {
    return await this.aggregateService.getConfig(id);
  }

  @Put(':id/lab-manager/adminer/start')
  async startAdminer(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.aggregateService.startAdminer(id);
  }

  @Put(':id/lab-manager/adminer/stop')
  async stopAdminer(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.aggregateService.stopAdminer(id);
  }

  //////////////////////////// BACKUP ////////////////////////////////
  @Post(':id/backup/prod')
  async backupProd(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnExternalLabBackup> {
    return await this.aggregateService.createProdBackup(id);
  }

  @Post(':id/backup/stop-current')
  async stopCurrentBackup(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.aggregateService.stopCurrentBackup(id);
  }

  @Get(':id/backup/current-status')
  async getCurrentBackup(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnExternalLabBackup> {
    return await this.aggregateService.getBackupCurrentStatus(id);
  }

  @Get(':id/backup/history')
  async getBackups(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnExternalLabBackupHistory> {
    return await this.aggregateService.getBackupHistory(id);
  }

  /////////////////////////// SERVER //////////////////////////////
  @Get(':id/server/info')
  async getServerInfo(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnCpCompleteInfo> {
    return await this.aggregateService.getServerInfo(id);
  }

  @Post(':id/server/init')
  async init(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstance> {
    return await this.aggregateService.init(id);
  }

  @Post(':id/server/configure-server')
  async configureServer(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstance> {
    return await this.aggregateService.configureServer(id);
  }

  @Post(':id/server/configure-lab')
  async configureLab(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstance> {
    return await this.aggregateService.configureLab(id);
  }

  @Delete(':id/server')
  async deleteServerInstance(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.aggregateService.deleteServerInstance(id);
  }
}
