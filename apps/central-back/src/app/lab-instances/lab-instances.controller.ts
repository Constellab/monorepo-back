import {Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {LabInstance} from './lab-instance.entity';
import {LabInstancesSecurityLayer} from './lab-instances-security-layer.service';
import {LabInstanceStatusHistory} from './lab-instance-status-history.entity';
import {LabInstanceToken} from './lab-instance-token.class';
import {ExternalLabUser, ExternalNewLabUser} from '../external-lab-api/external-lab-api.class';
import {BlDtoHelper, BlParsePipe} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {LabInstanceDto} from './lab-instance.dto';


@Controller('lab-instances')
export class LabInstancesController {

  constructor(private securityLayer: LabInstancesSecurityLayer) {
  }

  @Post()
  async create(@Body(new BlParsePipe(LabInstanceDto)) labInstanceDto: LabInstanceDto): Promise<LabInstanceDto> {
    const labInstance = await this.securityLayer.createSecure(BlDtoHelper.fromDto(LabInstance, labInstanceDto));
    return BlDtoHelper.toDto(LabInstanceDto,labInstance )
  }

  // use the DTO to get the apiKey (which is excluded)
  @Put()
  async update(@Body(new BlParsePipe(LabInstanceDto)) labInstanceDto: LabInstanceDto): Promise<LabInstanceDto> {
    const labInstance = await this.securityLayer.updateSecure(BlDtoHelper.fromDto(LabInstance, labInstanceDto));
    return BlDtoHelper.toDto(LabInstanceDto,labInstance )
  }

  /**
   * return the list of running lab instance created by the current user
   */
  @Get('current')
  public getCurrentLabInstances(@Query('page', ParseIntPipe) page: number,
                                @Query('size', ParseIntPipe) size: number): Promise<ClPage<LabInstance>> {
    return this.securityLayer.getCurrentLabInstances(page, size);
  }

  /**
   * return the list of running lab instance created by the current user
   */
  @Get('current-running')
  public getCurrentRunningLabInstances(): Promise<LabInstance[]> {
    return this.securityLayer.getCurrentRunningLabInstances();
  }

  @Get()
  async findAll(): Promise<LabInstanceDto[]> {
    // use a DTO to return all the field including the apiKey
    const labInstances = await this.securityLayer.findAll();
    return BlDtoHelper.listToDto(LabInstanceDto, labInstances);
  }

  /**
   * Get the lab instance with the server's info
   * Keep this route after the current otherwise the current routes will not work
   */
  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<LabInstance> {
    return this.securityLayer.findByIdAndCheckSecure(id);
  }

  /**
   * start a lab instance
   */
  @Put(':id/start')
  public startInstance(@Param('id', new ParseUUIDPipe()) id: string): Promise<LabInstance> {
    return this.securityLayer.startInstance(id);
  }

  /**
   * stop a lab instance
   */
  @Put(':id/stop')
  public stopInstance(@Param('id', new ParseUUIDPipe()) id: string): Promise<LabInstance> {
    return this.securityLayer.stopInstance(id);
  }

  /**
   * Log the current user to the lab instance
   * return the labInstance
   */
  @Post(':id/login')
  public login(@Param('id', new ParseUUIDPipe()) id: string): Promise<LabInstanceToken> {
    return this.securityLayer.login(id);
  }

  /**
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<LabInstanceStatusHistory[]> {
    return this.securityLayer.getStatusHistory(id);
  }

  /**
   * Get the users in the lab
   */
  @Get(':id/users')
  public getUsers(@Param('id', new ParseUUIDPipe()) id: string): Promise<ExternalLabUser[]> {
    return this.securityLayer.getLabUsers(id);
  }

  /**
   * Add a user to the lab
   */
  @Post(':id/add-user')
  public addUser(@Param('id', new ParseUUIDPipe()) id: string,
                 @Body() newUser: ExternalNewLabUser): Promise<ExternalLabUser> {
    return this.securityLayer.addUser(id, newUser);
  }

  /**
   * Update the lab name
   */
  @Put(':id/name/:name')
  public updateName(@Param('id', new ParseUUIDPipe()) id: string, @Param('name') name: string): Promise<LabInstance> {
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
