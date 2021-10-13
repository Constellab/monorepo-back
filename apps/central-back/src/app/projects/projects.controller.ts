import {Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Put, Query} from '@nestjs/common';
import {Project} from './project.entity';
import {AbstractSecureController} from '../core/class/abstract-secure.controller';
import {ProjectsSecurityLayer} from './projects-security.layer';
import {ProjectStatus} from './project-status.enum';
import {ProjectStatusHistory} from './project-status-history.entity';
import {BlParseEnumPipe} from '@monorepo/back-core-lib';
import {ClPageI} from '@monorepo/core-lib';

@Controller('projects')
export class ProjectsController extends AbstractSecureController<Project> {

  constructor(private securityLayer: ProjectsSecurityLayer) {
    super(securityLayer, Project);
  }

  /**
   * return the list of project created by the current user with pagination²
   */
  @Get('current')
  public getCurrentProjects(@Query('page', ParseIntPipe) page: number,
                            @Query('size', ParseIntPipe) size: number): Promise<ClPageI<Project>> {
    return this.securityLayer.getCurrentProjects(page, size);
  }

  @Put('/:id/status/:status')
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('status', new BlParseEnumPipe(ProjectStatus)) status: ProjectStatus): Promise<Project> {
    return this.securityLayer.updateCurrentStatus(status, id);
  }

  /**
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<ProjectStatusHistory[]> {
    return this.securityLayer.getStatusHistory(id);
  }
}
