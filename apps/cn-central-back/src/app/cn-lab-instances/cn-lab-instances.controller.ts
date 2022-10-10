import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstancesSecurityLayer} from './cn-lab-instances-security.layer';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnExternalLabUser, CnExternalNewLabUser} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {BlDtoHelper, BlParsePipe} from '@monorepo/back-core-lib';
import {ClPageI} from '@monorepo/core-lib';
import {CnLabInstanceConfigDTO, CnLabInstanceDto} from './cn-lab-instance.dto';
import {
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabManagerStatus
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';

@Controller('lab-instances')
export class CnLabInstancesController {

  constructor(private securityLayer: CnLabInstancesSecurityLayer) {
  }

  @Post()
  async create(@Body(new BlParsePipe(CnLabInstanceDto)) labInstanceDto: CnLabInstanceDto): Promise<CnLabInstanceDto> {
    const labInstance = await this.securityLayer.createSecure(BlDtoHelper.fromDto(CnLabInstance, labInstanceDto));
    return BlDtoHelper.toDto(CnLabInstanceDto, labInstance);
  }

  // use the DTO to get the apiKey (which is excluded)
  @Put()
  async update(@Body(new BlParsePipe(CnLabInstanceDto)) labInstanceDto: CnLabInstanceDto): Promise<CnLabInstanceDto> {
    const labInstance = await this.securityLayer.updateSecure(BlDtoHelper.fromDto(CnLabInstance, labInstanceDto));
    return BlDtoHelper.toDto(CnLabInstanceDto, labInstance);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.securityLayer.deleteByIdSecure(id);
  }

  /**
   * return the list of running lab instance created by the current user
   */
  @Get('current')
  public getCurrentLabInstances(@Query('page', ParseIntPipe) page: number,
                                @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnLabInstance>> {
    return this.securityLayer.getCurrentLabInstances(page, size);
  }

  /**
   * return the list of running lab instance created by the current user
   */
  @Get('current-running')
  public getCurrentRunningLabInstances(): Promise<CnLabInstance[]> {
    return this.securityLayer.getCurrentRunningLabInstances();
  }

  @Get()
  async findAll(): Promise<CnLabInstanceDto[]> {
    // use a DTO to return all the field including the apiKey
    const labInstances = await this.securityLayer.findAll();
    return BlDtoHelper.listToDto(CnLabInstanceDto, labInstances);
  }

  /**
   * Get the lab instance with the server's info
   * Keep this route after the current otherwise the current routes will not work
   */
  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstance> {
    return this.securityLayer.findByIdAndCheckSecure(id);
  }

  /**
   * start a lab instance
   */
  @Put(':id/start')
  public startInstance(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstance> {
    return this.securityLayer.startInstance(id);
  }

  /**
   * stop a lab instance
   */
  @Put(':id/stop')
  public stopInstance(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstance> {
    return this.securityLayer.stopInstance(id);
  }

  /**
   * Get the url to log into the lab
   * return the labInstance
   */
  @Get(':id/login')
  public async login(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    const result = await this.securityLayer.login(id);
    // redirect to lab auto login page
    return {url: result.labInstance.getGlabApiInfo().apiUrl + '/core-api/login-temp-access/' + result.token};
  }

  /**
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceStatusHistory[]> {
    return this.securityLayer.getStatusHistory(id);
  }

  /**
   * Get the users in the lab
   */
  @Get(':id/users')
  public getUsers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnExternalLabUser[]> {
    return this.securityLayer.getLabUsers(id);
  }

  /**
   * Add a user to the lab
   */
  @Post(':id/add-user')
  public addUser(@Param('id', new ParseUUIDPipe()) id: string,
                 @Body() newUser: CnExternalNewLabUser): Promise<CnExternalLabUser> {
    return this.securityLayer.addUser(id, newUser);
  }

  /**
   * Update the lab name
   */
  @Put(':id/name/:name')
  public updateName(@Param('id', new ParseUUIDPipe()) id: string, @Param('name') name: string): Promise<CnLabInstance> {
    return this.securityLayer.updateName(id, name);
  }

  /**
   * Check the lab status and returns settings if ok
   */
  @Get(':id/check-status')
  public checkStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.securityLayer.checkStatus(id);
  }

  /**
   * Check the lab status and returns settings if ok
   */
  @Get(':id/lab-config')
  public getLabInstanceConfig(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabConfig> {
    return this.securityLayer.getLabInstanceConfig(id);
  }

  //////////////////////////// LAB MANAGER ////////////////////////////////

  @Get(':id/status')
  async getContainersStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabManagerStatus> {
    return this.securityLayer.getStatus(id);
  }

  @Get(':id/containers')
  async listContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabDockerPs[]> {
    return await this.securityLayer.listContainers(id);
  }

  @Get(':id/:containerName/logs')
  async getLogs(@Param('id', new ParseUUIDPipe()) id: string, @Param('containerName') containerName: string): Promise<string> {
    return await this.securityLayer.getLogs(id, containerName);
  }

  @Post(':id/init-all')
  async initAll(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.securityLayer.initAll(id);
  }

  @Post(':id/up-containers')
  async upContainers(@Param('id', new ParseUUIDPipe()) id: string,
                     @Body() options: CnLabComposeUpOptions): Promise<void> {
    return await this.securityLayer.upContainers(id, options);
  }

  @Post(':id/restart-containers')
  async restartContainers(@Param('id', new ParseUUIDPipe()) id: string,
                          @Body() options: CnLabComposeUpOptions): Promise<void> {
    return await this.securityLayer.restartContainers(id, options);
  }

  @Post(':id/down-containers')
  async downContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.securityLayer.downContainers(id);
  }

  @Post(':id/pull-containers')
  async pullContainers(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return await this.securityLayer.pullContainers(id);
  }

  @Post(':id/pull-biota-db')
  async pullBiotaDb(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.securityLayer.pullBiota(id);
  }

  @Post(':id/registry-login')
  async registryLogin(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.securityLayer.registryLogin(id);
  }

  @Post(':id/stop-current-task')
  public stopCurrentTask(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.securityLayer.stopCurrentTask(id);
  }

  @Post(':id/system-prune')
  public systemPrune(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.securityLayer.systemPrune(id);
  }

  @Put(':id/config')
  async updateConfig(@Param('id', new ParseUUIDPipe()) id: string,
                     @Body() config: CnLabInstanceConfigDTO): Promise<void> {
    return await this.securityLayer.updateConfig(id, config);
  }

  @Get(':id/config')
  async getConfig(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceConfigDTO> {
    return await this.securityLayer.getConfig(id);
  }

  @Put(':id/adminer/start')
  async startAdminer(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.securityLayer.startAdminer(id);
  }

  @Put(':id/adminer/stop')
  async stopAdminer(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return await this.securityLayer.stopAdminer(id);
  }

}
