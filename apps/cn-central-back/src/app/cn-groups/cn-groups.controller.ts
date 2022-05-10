import {Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnGroupsService} from './cn-groups.service';
import {CnGroup} from './cn-group.entity';
import {ClPageI} from '@monorepo/core-lib';
import {CnUser} from '../cn-users/cn-user.entity';

@Controller('groups')
export class CnGroupsController {

  constructor(private service: CnGroupsService) {
  }

  @Get('all-current')
  public getAllCurrentGroups(): Promise<CnGroup[]> {
    return this.service.getCurrentUserAllGroups();
  }

  @Get('current')
  public getCurrentGroups(@Query('page', ParseIntPipe) page: number,
                          @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnGroup>> {
    return this.service.getCurrentUserGroups(page, size);
  }

  @Get(':id')
  public getTeamById(@Param('id', ParseUUIDPipe) id: string): Promise<CnGroup> {
    return this.service.getAndCheckTeamById(id);
  }

  @Get(':id/users')
  public getTeamUsers(@Param('id', ParseUUIDPipe) id: string,
                      @Query('page', ParseIntPipe) page: number,
                      @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnUser>> {
    return this.service.getUsersOfTeam(id, page, size);
  }

  @Post(':label')
  public createTeam(@Param('label') label: string): Promise<CnGroup> {
    return this.service.createTeam(label);
  }

  @Put(':id/label/:label')
  public updateTeamLabel(@Param('id', new ParseUUIDPipe()) id: string,
                         @Param('label') label: string): Promise<CnGroup> {
    return this.service.updateTeamLabel(id, label);
  }

  @Post(':id/add-user/:userId')
  public addUserToTeam(@Param('id', new ParseUUIDPipe()) id: string,
                       @Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnUser> {
    return this.service.addUserToTeam(userId, id);
  }

  @Delete(':id/remove-user/:userId')
  public removeUserFromTeam(@Param('id', new ParseUUIDPipe()) id: string,
                            @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.service.removeUserFromTeam(userId, id);
  }

  @Delete(':id')
  public async deleteTeam(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.service.deleteTeamById(id);
  }

}
