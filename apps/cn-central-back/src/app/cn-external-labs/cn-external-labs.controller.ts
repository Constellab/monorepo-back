import {Body, Controller, Get, Param, ParseUUIDPipe, Put, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {CnLabInstancesService} from '../cn-lab-instances/cn-lab-instances.service';
import {ClLabGuard} from '../cn-core/decorators/cn-lab-guard.decorator';
import {CnReport} from '../cn-projects-aggregate/cn-reports/cn-report.entity';
import {BlFile, BlParsePipe} from '@monorepo/back-core-lib';
import {CnCreateLabExperimentDto} from '../cn-projects-aggregate/cn-experiments/cn-experiment.dto';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnCreateReportDto} from '../cn-projects-aggregate/cn-reports/cn-report.dto';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ClCoreJsonConvert} from '@monorepo/core-lib';
import {CnLabInstanceStartDTO} from '../cn-lab-instances/cn-lab-instance.dto';
import {CnProjectAggregateService} from '../cn-projects-aggregate/cn-project-aggregate.service';

/**
 * Specific controller for route called by the lab servers. These routes are not called by a user
 */
@ClLabGuard()
@Controller('external-labs')
export class CnExternalLabsController {

  constructor(private labInstanceService: CnLabInstancesService,
              private projectAggregator: CnProjectAggregateService) {
  }

  // route called on the lab start
  @Put('start')
  onLabStart(@Body() labStart: CnLabInstanceStartDTO): Promise<void> {
    return this.labInstanceService.onStart(labStart);
  }

  @Get('/user/:userId/projects')
  getProjectsOfUser(
    @Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnProject[]> {
    return this.projectAggregator.getProjectsOfUserId(userId);
  }


  @Put('project/:projectId/experiment')
  createOrUpdateExperiment(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body(new BlParsePipe(CnCreateLabExperimentDto)) createLabExperimentDto: CnCreateLabExperimentDto): Promise<void> {
    return this.projectAggregator.createLabExperiment(projectId, createLabExperimentDto);
  }


  @UseInterceptors(FilesInterceptor('files'))
  @Put('project/:projectId/report')
  saveReport(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() body: { body: string },
    @UploadedFiles() files: BlFile[]): Promise<CnReport> {
    const createReportDto: CnCreateReportDto = ClCoreJsonConvert.deserializeObject(JSON.parse(body.body), CnCreateReportDto);
    return this.projectAggregator.createReport(createReportDto, projectId, files);
  }
}
