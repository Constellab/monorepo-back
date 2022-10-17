import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnProjectStatus} from './cn-projects/cn-project-status.enum';
import {CnProjectStatusHistory} from './cn-projects/cn-project-status-history.entity';
import {BlParseEnumPipe, BlParsePipe} from '@monorepo/back-core-lib';
import {ClPageI} from '@monorepo/core-lib';
import {CnGroup} from '../cn-groups/cn-group.entity';
import {CnProjectAggregateService} from './cn-project-aggregate.service';
import {CnProjectAncestorTreeDTO, CnProjectAncestorType} from './cn-projects/cn-project.dto';
import {CnUser} from '../cn-users/cn-user.entity';

@Controller('projects')
export class CnProjectsController {

  constructor(private projectAggregate: CnProjectAggregateService) {
  }

  @Post()
  create(@Body(new BlParsePipe(CnProject)) project: CnProject): Promise<CnProject> {
    return this.projectAggregate.createProject(project);
  }

  @Post(':id/sub-project')
  createSubProject(@Param('id', ParseUUIDPipe) id: string,
                   @Body(new BlParsePipe(CnProject)) workPackage: CnProject): Promise<CnProject> {
    return this.projectAggregate.createSubProject(workPackage, id);
  }

  @Put()
  update(@Body(new BlParsePipe(CnProject)) project: CnProject): Promise<CnProject> {
    return this.projectAggregate.updateProject(project);
  }

  /**
   * return the list of project created by the current user with pagination
   */
  @Get('current')
  public getCurrentProjects(@Query('page', ParseIntPipe) page: number,
                            @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnProject>> {
    return this.projectAggregate.getCurrentProjects(page, size);
  }

  @Get('group/:groupId')
  public getByTeam(@Param('groupId', new ParseUUIDPipe()) groupId: string,
                   @Query('page', ParseIntPipe) page: number,
                   @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnProject>> {
    return this.projectAggregate.getProjectOfTeam(groupId, page, size);
  }

  @Put(':id/status/:status')
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('status', new BlParseEnumPipe(CnProjectStatus)) status: CnProjectStatus): Promise<CnProject> {
    return this.projectAggregate.updateProjectCurrentStatus(status, id);
  }

  /**
   * Get the list of group the project is shared with
   */
  @Get(':id/shared-groups')
  getProjectSharedGroups(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnGroup[]> {
    return this.projectAggregate.getProjectSharedGroups(id);
  }

  @Put(':id/share/:groupId')
  shareProject(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('groupId', new ParseUUIDPipe()) groupId: string): Promise<CnGroup> {
    return this.projectAggregate.shareProject(id, groupId);
  }

  @Delete(':id/unshare/:groupId')
  unshareProject(@Param('id', new ParseUUIDPipe()) id: string,
                 @Param('groupId', new ParseUUIDPipe()) groupId: string): Promise<void> {
    return this.projectAggregate.unshareProject(id, groupId);
  }

  /**
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnProjectStatusHistory[]> {
    return this.projectAggregate.getProjectStatusHistory(id);
  }

  @Get(':id/tree')
  getProjectTree(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnProject> {
    return this.projectAggregate.getProjectTree(id);
  }

  @Get(':id/children')
  getChildren(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnProject[]> {
    return this.projectAggregate.getChildren(id);
  }

  /**
   * Return a simplified list of ancestor for an object (project, experiment, report) to the main project
   * @param objectType
   * @param id
   */
  @Get('ancestors/:objectType/:id')
  getObjectProjectAncestors(@Param('objectType') objectType: CnProjectAncestorType,
                            @Param('id', new ParseUUIDPipe()) id: string): Promise<CnProjectAncestorTreeDTO[]> {
    return this.projectAggregate.getObjectProjectAncestors(objectType, id);
  }

  @Get(':id/users')
  getUsersOfProject(@Param('id', ParseUUIDPipe) id: string): Promise<CnUser[]> {
    return this.projectAggregate.getUserOfProject(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CnProject> {
    return this.projectAggregate.findProject(id);
  }
}
