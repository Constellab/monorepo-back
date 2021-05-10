import {Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {LabInstance} from './lab-instance.entity';
import {LabInstancesSecurityLayer} from './lab-instances-security-layer.service';
import {LabInstanceStatusHistory} from './lab-instance-status-history.entity';
import {LabInstanceToken} from './lab-instance-token.class';
import {Page} from '../core/model/config/page.class';
import {ParsePipe} from '../core/pipes/parse.pipe';
import {ExternalLabUser, ExternalNewLabUser} from '../external-lab-api/external-lab-api.class';


@Controller('lab-instances')
export class LabInstancesController {

  constructor(private securityLayer: LabInstancesSecurityLayer) {
  }

  @Post()
  create(@Body(new ParsePipe(LabInstance)) labInstance: LabInstance): Promise<LabInstance> {
    return this.securityLayer.createSecure(labInstance);
  }

  @Put()
  update(@Body(new ParsePipe(LabInstance)) labInstance: LabInstance): Promise<LabInstance> {
    return this.securityLayer.updateSecure(labInstance);
  }

  /**
   * return the list of running lab instance created by the current user
   */
  @Get('current')
  public getCurrentLabInstances(@Query('page', ParseIntPipe) page: number,
                                @Query('size', ParseIntPipe) size: number): Promise<Page<LabInstance>> {
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
  findAll(): Promise<LabInstance[]> {
    return this.securityLayer.findAll();
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

}
