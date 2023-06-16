import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnGroup, CnGroupTeam, CnUserGroup} from './cn-group.entity';
import {ClPageI} from '@monorepo/core-lib';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnGroupsAggregateService} from './cn-groups-aggregate.service';
import {BlParsePipe, BlSearchParams} from '@monorepo/back-core-lib';

@Controller('groups')
export class CnGroupsController {

  constructor(private aggregateService: CnGroupsAggregateService) {
  }


  @Get('all-current')
  public getAllCurrentGroups(@Query('page', ParseIntPipe) page: number,
                             @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnGroup>> {
    return this.aggregateService.findGroupsOfCurrentSpace(page, size);
  }

  ///////////////////////////// TEAMS ////////////////////////////////////

  @Get('teams/current')
  public getCurrentTeams(@Query('page', ParseIntPipe) page: number,
                         @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnGroup>> {
    return this.aggregateService.findTeamsByCurrentUserAndSpace(page, size);
  }

  @Get('teams/current-space')
  public async getCurrentSpace(@Query('page', ParseIntPipe) page: number,
                               @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnGroup>> {
    return this.aggregateService.findTeamsByCurrentSpace(page, size);
  }

  @Get('teams/:id')
  public getTeamById(@Param('id', ParseUUIDPipe) id: string): Promise<CnGroup> {
    return this.aggregateService.getAndCheckTeamById(id);
  }

  @Get('teams/:id/users')
  public getTeamUsers(@Param('id', ParseUUIDPipe) id: string,
                      @Query('page', ParseIntPipe) page: number,
                      @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnUserGroup>> {
    return this.aggregateService.getUsersOfTeam(id, page, size);
  }

  @Post('teams/:label')
  public createTeam(@Param('label') label: string): Promise<CnGroup> {
    return this.aggregateService.createTeam(label);
  }

  @Put('teams/:id/label/:label')
  public updateTeamLabel(@Param('id', new ParseUUIDPipe()) id: string,
                         @Param('label') label: string): Promise<CnGroup> {
    return this.aggregateService.updateTeamLabel(id, label);
  }

  @Post('teams/:id/add-user/:userId')
  public addUserToTeam(@Param('id', new ParseUUIDPipe()) id: string,
                       @Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnUserGroup> {
    return this.aggregateService.addUserToTeam(userId, id);
  }

  @Delete('teams/:id/remove-user/:userId')
  public removeUserFromTeam(@Param('id', new ParseUUIDPipe()) id: string,
                            @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.aggregateService.removeUserFromTeam(userId, id);
  }

  @Delete('teams/:id')
  public async deleteTeam(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.aggregateService.deleteTeamById(id);
  }

  @Post('teams/current-space/search')
  async searchTeamsInCurrentSpace(@Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                                  @Query('page', ParseIntPipe) page: number,
                                  @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnGroupTeam>> {
    return await this.aggregateService.searchTeamsInCurrentSpace(searchParam, page, size);
  }

}
