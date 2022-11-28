import {Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnGroup} from './cn-group.entity';
import {ClPageI} from '@monorepo/core-lib';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnGroupsAggregateService} from './cn-groups-aggregate.service';

@Controller('groups')
export class CnGroupsController {

  constructor(private aggregateService: CnGroupsAggregateService) {
  }

  @Get('all-current')
  public getAllCurrentTeams(): Promise<CnGroup[]> {
    return this.aggregateService.getAllByCurrentUserAndSpace();
  }

  @Get('current')
  public getCurrentTeams(@Query('page', ParseIntPipe) page: number,
                         @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnGroup>> {
    return this.aggregateService.getByCurrentUserAndSpace(page, size);
  }

  @Get('current-space')
  public async getCurrentSpace(@Query('page', ParseIntPipe) page: number,
                                      @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnGroup>> {
    return this.aggregateService.getByCurrentSpace(page, size);
  }

  @Get(':id')
  public getTeamById(@Param('id', ParseUUIDPipe) id: string): Promise<CnGroup> {
    return this.aggregateService.getAndCheckTeamById(id);
  }

  @Get(':id/users')
  public getTeamUsers(@Param('id', ParseUUIDPipe) id: string,
                      @Query('page', ParseIntPipe) page: number,
                      @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnUser>> {
    return this.aggregateService.getUsersOfTeam(id, page, size);
  }

  @Post(':label')
  public createTeam(@Param('label') label: string): Promise<CnGroup> {
    return this.aggregateService.createTeam(label);
  }

  @Put(':id/label/:label')
  public updateTeamLabel(@Param('id', new ParseUUIDPipe()) id: string,
                         @Param('label') label: string): Promise<CnGroup> {
    return this.aggregateService.updateTeamLabel(id, label);
  }

  @Post(':id/add-user/:userId')
  public addUserToTeam(@Param('id', new ParseUUIDPipe()) id: string,
                       @Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnUser> {
    return this.aggregateService.addUserToTeam(userId, id);
  }

  @Delete(':id/remove-user/:userId')
  public removeUserFromTeam(@Param('id', new ParseUUIDPipe()) id: string,
                            @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.aggregateService.removeUserFromTeam(userId, id);
  }

  @Delete(':id')
  public async deleteTeam(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.aggregateService.deleteTeamById(id);
  }

}
