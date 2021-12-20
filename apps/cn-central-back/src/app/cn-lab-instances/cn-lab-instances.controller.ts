import {Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstancesSecurityLayer} from './cn-lab-instances-security.layer';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnLabInstanceToken} from './cn-lab-instance-token.class';
import {CnExternalLabUser, CnExternalNewLabUser} from '../cn-external-lab-api/cn-external-lab-api.class';
import {BlDtoHelper, BlParsePipe} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {CnLabInstanceDto} from './cn-lab-instance.dto';


@Controller('lab-instances')
export class CnLabInstancesController {

  constructor(private securityLayer: CnLabInstancesSecurityLayer) {
  }

  @Post()
  async create(@Body(new BlParsePipe(CnLabInstanceDto)) labInstanceDto: CnLabInstanceDto): Promise<CnLabInstanceDto> {
    const labInstance = await this.securityLayer.createSecure(BlDtoHelper.fromDto(CnLabInstance, labInstanceDto));
    return BlDtoHelper.toDto(CnLabInstanceDto,labInstance )
  }

  // use the DTO to get the apiKey (which is excluded)
  @Put()
  async update(@Body(new BlParsePipe(CnLabInstanceDto)) labInstanceDto: CnLabInstanceDto): Promise<CnLabInstanceDto> {
    const labInstance = await this.securityLayer.updateSecure(BlDtoHelper.fromDto(CnLabInstance, labInstanceDto));
    return BlDtoHelper.toDto(CnLabInstanceDto,labInstance )
  }

  /**
   * return the list of running lab instance created by the current user
   */
  @Get('current')
  public getCurrentLabInstances(@Query('page', ParseIntPipe) page: number,
                                @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnLabInstance>> {
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
   * Log the current user to the lab instance
   * return the labInstance
   */
  @Post(':id/login')
  public login(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabInstanceToken> {
    return this.securityLayer.login(id);
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

}
