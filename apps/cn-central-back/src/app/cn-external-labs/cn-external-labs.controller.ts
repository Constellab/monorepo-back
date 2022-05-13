import {Body, Controller, Get, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {CnLabInstancesService} from '../cn-lab-instances/cn-lab-instances.service';
import {ClLabGuard} from '../cn-core/decorators/cn-lab-guard.decorator';
import {CnReport} from '../cn-projects-aggregate/cn-reports/cn-report.entity';
import {BlParsePipe} from '@monorepo/back-core-lib';
import {CnCreateLabExperimentDto} from '../cn-projects-aggregate/cn-experiments/cn-experiment.dto';
import {CnCreateReportWithConfigDto} from '../cn-projects-aggregate/cn-reports/cn-report.dto';
import {CnLabInstanceStartDTO} from '../cn-lab-instances/cn-lab-instance.dto';
import {CnProjectAggregateService} from '../cn-projects-aggregate/cn-project-aggregate.service';
import {CnLabInstanceSendMailDto} from '../cn-lab-instances/cn-lab-instance-mail.dto';
import {CnLabInstanceMailService} from '../cn-lab-instances/cn-lab-instance-mail.service';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';

/**
 * Specific controller for route called by the lab servers. These routes are not called by a user
 */
@ClLabGuard()
@Controller('external-labs')
export class CnExternalLabsController {

  constructor(private labInstanceService: CnLabInstancesService,
              private projectAggregator: CnProjectAggregateService,
              private labInstanceMailService: CnLabInstanceMailService) {
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


  @Put('project/:projectId/report')
  saveReport(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() createReportDto: CnCreateReportWithConfigDto): Promise<CnReport> {
    return this.projectAggregator.createReport(createReportDto, projectId);
  }

  /**
   * Route to send an email from the lab
   * @param body
   */
  @Post('send-mail')
  sendMail(@Body() body: CnLabInstanceSendMailDto): Promise<void> {
    return this.labInstanceMailService.sendMailFromLab(CnCurrentUserHelper.getAndCheckCurrentLabInstance(),
      body);
  }
}
