import {Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Put, Query} from '@nestjs/common';
import {CnProject} from './cn-project.entity';
import {CnAbstractSecureController} from '../cn-core/class/cn-abstract-secure.controller';
import {CnProjectsSecurityLayer} from './cn-projects-security.layer';
import {CnProjectStatus} from './cn-project-status.enum';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {BlParseEnumPipe} from '@monorepo/back-core-lib';
import {ClPageI} from '@monorepo/core-lib';

@Controller('projects')
export class CnProjectsController extends CnAbstractSecureController<CnProject> {

  constructor(private securityLayer: CnProjectsSecurityLayer) {
    super(securityLayer, CnProject);
  }

  /**
   * return the list of project created by the current user with pagination²
   */
  @Get('current')
  public getCurrentProjects(@Query('page', ParseIntPipe) page: number,
                            @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnProject>> {
    return this.securityLayer.getCurrentProjects(page, size);
  }

  @Put('/:id/status/:status')
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('status', new BlParseEnumPipe(CnProjectStatus)) status: CnProjectStatus): Promise<CnProject> {
    return this.securityLayer.updateCurrentStatus(status, id);
  }

  /**
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnProjectStatusHistory[]> {
    return this.securityLayer.getStatusHistory(id);
  }
}
