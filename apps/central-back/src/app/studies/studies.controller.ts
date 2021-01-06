import {Body, Controller, Get, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {StudiesSecurityLayer} from './studies-security.layer';
import {ParsePipe} from '../core/pipes/parse.pipe';
import {Study} from './study.entity';
import {ParseEnumPipe} from '../core/pipes/parse-enum.pipe';
import {StudyStatusHistory} from './study-status-history.entity';
import {StudyStatus} from './study-status.enum';

@Controller('studies')
export class StudiesController {

  constructor(private securityLayer: StudiesSecurityLayer) {
  }

  /**
   * Create an study for a project
   */
  @Post('project/:projectId')
  create(@Body(new ParsePipe(Study)) study: Study,
         @Param('projectId', ParseUUIDPipe) projectId: string): Promise<Study> {
    return this.securityLayer.createStudy(study, projectId);
  }

  @Put()
  update(@Body(new ParsePipe(Study)) study: Study): Promise<Study> {
    return this.securityLayer.updateSecure(study);
  }

  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Study> {
    return this.securityLayer.findByIdAndCheckSecure(id);
  }

  /**
   * Return the list of studies of a project
   */
  @Get('project/:projectId')
  public getStudiesOfProject(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<Study[]> {
    return this.securityLayer.getStudiesOfProject(projectId);
  }

  ////////////////////// STATUS ////////////////////
  /**
   * Update the current status of the study
   */
  @Put('/:id/status/:status')
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('status', new ParseEnumPipe(StudyStatus)) status: StudyStatus): Promise<Study> {
    return this.securityLayer.updateCurrentStatus(status, id);
  }

  /**
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<StudyStatusHistory[]> {
    return this.securityLayer.getStatusHistory(id);
  }


}
