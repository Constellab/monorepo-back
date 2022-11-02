import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstanceAggregateService} from './cn-lab-instance-aggregate.service';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnExternalLabUser, CnExternalNewLabUser} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {BlDtoHelper, BlParseEnumPipe, BlParsePipe} from '@monorepo/back-core-lib';
import {ClPageI} from '@monorepo/core-lib';
import {
  CnLabFindOneDto,
  CnLabInstanceAdminDto,
  CnLabInstanceConfigDTO,
  CnLabInstanceCreateDTO,
} from './cn-lab-instance.dto';
import {
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabManagerStatus
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabInstanceGroup, CnLabInstanceGroupRole} from './cn-lab-instance-group.entity';
import {CnUser} from '../cn-users/cn-user.entity';

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
   * return the list of running lab instance created by the current user
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

  @Get('current-organization')
  async getByCurrentOrganization(@Query('page', ParseIntPipe) page: number,
                                 @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnLabInstance>> {
    return await this.aggregateService.getByCurrentOrganization(page, size);
  }


  @Get()
  async findAll(): Promise<CnLabInstanceAdminDto[]> {
    // use a DTO to return all the field including the apiKey
    const labInstances = await this.aggregateService.findAll();
    return BlDtoHelper.listToDto(CnLabInstanceAdminDto, labInstances);
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
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusHistory[]> {
    return this.aggregateService.getStatusHistory(id);
  }

  /**
   * Get the users in the lab
   */
  @Get(':id/users')
  public getUsers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnExternalLabUser[]> {
    return this.aggregateService.getLabUsers(id);
  }

  /**
   * Add a user to the lab
   */
  @Post(':id/add-user')
  public addUser(@Param('id', new ParseUUIDPipe()) id: string,
                 @Body() newUser: CnExternalNewLabUser): Promise<CnExternalLabUser> {
    return this.aggregateService.addUser(id, newUser);
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

  //////////////////////////// GROUPS ////////////////////////////////

  @Post(':id/share/:groupId/:role')
  public share(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('groupId', new ParseUUIDPipe()) groupId: string,
               @Param('role', new BlParseEnumPipe(CnLabInstanceGroupRole)) role: CnLabInstanceGroupRole): Promise<CnLabInstanceGroup> {
    return this.aggregateService.shareLabInstance(id, groupId, role);
  }

  @Put(':id/share/:groupId/:role')
  public updateShareRole(@Param('id', new ParseUUIDPipe()) id: string,
                         @Param('groupId', new ParseUUIDPipe()) groupId: string,
                         @Param('role', new BlParseEnumPipe(CnLabInstanceGroupRole)) role: CnLabInstanceGroupRole)
    : Promise<CnLabInstanceGroup> {
    return this.aggregateService.updateShareRole(id, groupId, role);
  }

  @Delete(':id/share/:groupId')
  public unshare(@Param('id', new ParseUUIDPipe()) id: string,
                 @Param('groupId', new ParseUUIDPipe()) groupId: string): Promise<void> {
    return this.aggregateService.unshareLabInstance(id, groupId);
  }

  @Get(':id/share')
  public getSharedGroups(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceGroup[]> {
    return this.aggregateService.getLabInstanceSharedGroups(id);
  }

  @Get(':id/share/users')
  public getSharedUsers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnUser[]> {
    return this.aggregateService.getLabInstanceSharedUsers(id);
  }

  //////////////////////////// LAB MANAGER ////////////////////////////////

  @Get(':id/status')
  async getContainersStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabManagerStatus> {
    return this.aggregateService.getStatus(id);
  }

  @Get(':id/containers')
  async listContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabDockerPs[]> {
    return await this.aggregateService.listContainers(id);
  }

  @Get(':id/:containerName/logs')
  async getLogs(@Param('id', new ParseUUIDPipe()) id: string, @Param('containerName') containerName: string): Promise<string> {
    return await this.aggregateService.getLogs(id, containerName);
  }

  @Post(':id/init-all')
  async initAll(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.initAll(id);
  }

  @Post(':id/up-containers')
  async upContainers(@Param('id', new ParseUUIDPipe()) id: string,
                     @Body() options: CnLabComposeUpOptions): Promise<void> {
    return await this.aggregateService.upContainers(id, options);
  }

  @Post(':id/restart-containers')
  async restartContainers(@Param('id', new ParseUUIDPipe()) id: string,
                          @Body() options: CnLabComposeUpOptions): Promise<void> {
    return await this.aggregateService.restartContainers(id, options);
  }

  @Post(':id/down-containers')
  async downContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.downContainers(id);
  }

  @Post(':id/pull-containers')
  async pullContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.aggregateService.pullContainers(id);
  }

  @Post(':id/pull-biota-db')
  async pullBiotaDb(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.pullBiota(id);
  }

  @Post(':id/registry-login')
  async registryLogin(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.registryLogin(id);
  }

  @Post(':id/stop-current-task')
  public stopCurrentTask(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.stopCurrentTask(id);
  }

  @Post(':id/system-prune')
  public systemPrune(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.systemPrune(id);
  }

  @Put(':id/config')
  async updateConfig(@Param('id', new ParseUUIDPipe()) id: string,
                     @Body() config: CnLabInstanceConfigDTO): Promise<void> {
    return await this.aggregateService.updateConfig(id, config);
  }

  @Get(':id/config')
  async getConfig(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceConfigDTO> {
    return await this.aggregateService.getConfig(id);
  }

  @Put(':id/adminer/start')
  async startAdminer(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.aggregateService.startAdminer(id);
  }

  @Put(':id/adminer/stop')
  async stopAdminer(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.aggregateService.stopAdminer(id);
  }

}
