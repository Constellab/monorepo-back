import { Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { CnLabProject } from './cn-lab-project.entity';
import { CnLabProjectAggregateService } from './cn-lab-project-aggregate.service';

@Controller('lab-project')
export class CnLabProjectController {

  constructor(private labProjectAggregateService: CnLabProjectAggregateService) {
  }


  //////////////////////////// PROJECT ////////////////////////////////

  @Post(':id/project/:projectId')
  public addProject(@Param('id', new ParseUUIDPipe()) id: string,
                    @Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<CnLabProject> {
    return this.labProjectAggregateService.addProjectToLab(id, projectId);
  }

  @Delete(':id/project/:projectId')
  public removeProject(@Param('id', new ParseUUIDPipe()) id: string,
                       @Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<void> {
    return this.labProjectAggregateService.checkAndRemoveProjectFromLab(id, projectId);
  }

  @Get(':id/project')
  public getProjects(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabProject[]> {
    return this.labProjectAggregateService.getLabInstanceProjects(id);
  }

  @Put(':id/project/:projectId/sync')
  public forceSync(@Param('id', new ParseUUIDPipe()) id: string,
                   @Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<void> {
    return this.labProjectAggregateService.forceProjectSyncToLab(id, projectId);
  }
}
