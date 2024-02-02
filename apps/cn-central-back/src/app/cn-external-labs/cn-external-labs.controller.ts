import {Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseInterceptors} from '@nestjs/common';
import {CnLabGuard, CnLabRobotAuthentication} from '../cn-core/decorators/cn-lab-guard.decorator';
import {BlCredentials, BlFile, BlParsePipe, BlUploadedFiles} from '@monorepo/back-core-lib';
import {CnCreateLabExperimentDto} from '../cn-projects-aggregate/cn-experiments/cn-experiment.dto';
import {CnCreateReportWithConfigDto} from '../cn-projects-aggregate/cn-reports/cn-report.dto';
import {CnLabInstanceStartDTO} from '../cn-lab-instances/cn-lab-instance.dto';
import {CnProjectAggregateService} from '../cn-projects-aggregate/cn-project-aggregate.service';
import {CnLabInstanceSendMailDto} from '../cn-lab-instances/mail/cn-lab-instance-mail.dto';
import {CnLabInstanceMailService} from '../cn-lab-instances/mail/cn-lab-instance-mail.service';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnLabInstanceAggregateService} from '../cn-lab-instances/cn-lab-instance-aggregate.service';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ClCoreJsonConvert} from '@monorepo/core-lib';
import {CnExternalLabUser} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {CnProjectDtoHelper, CnProjectTreeDTO} from '../cn-projects-aggregate/cn-projects/cn-project.dto';
import {CnExternalCheckCredentialResponse} from '../cn-auth/cn-auth.service';

/**
 * Specific controller for route called by the lab servers. These routes are not called by a user
 */
@CnLabGuard()
@Controller('external-labs')
export class CnExternalLabsController {

  constructor(private labInstanceAggregator: CnLabInstanceAggregateService,
              private projectAggregator: CnProjectAggregateService,
              private labInstanceMailService: CnLabInstanceMailService) {
  }

  // route called on the lab start
  @CnLabRobotAuthentication()
  @Put('start')
  onLabStart(@Body() labStart: CnLabInstanceStartDTO): Promise<void> {
    return this.labInstanceAggregator.registerLabConfig(labStart);
  }

  /**
   * Check user credentials for login
   * @param credentials
   */
  @CnLabRobotAuthentication()
  @Post('check-credentials')
  async checkUserCredentials(@Body() credentials: BlCredentials): Promise<CnExternalCheckCredentialResponse> {
    return this.labInstanceAggregator.checkUserCredentials(credentials, false, false);
  }

  /**
   * Check if the guard pass
   * @param req
   * return true if the guard pass
   */
  @CnLabGuard()
  @Get('check-test')
  async checkTest(@Req() req: Request): Promise<boolean> {
    return true;
  }

  /**
   * Check the user credentials without checking captcha nor 2Fa.
   * This route is not supposed to be used for login.
   * @param credentials
   */
  @CnLabRobotAuthentication()
  @Post('check-credentials-simple')
  async checkUserCredentialsSimple(@Body() credentials: BlCredentials): Promise<CnExternalCheckCredentialResponse> {
    return this.labInstanceAggregator.checkUserCredentials(credentials, true, true);
  }

  @Put('project/:projectId/experiment')
  createOrUpdateExperiment(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body(new BlParsePipe(CnCreateLabExperimentDto)) createLabExperimentDto: CnCreateLabExperimentDto): Promise<void> {
    return this.projectAggregator.createLabExperiment(projectId, createLabExperimentDto);
  }

  @Delete('project/:projectId/experiment/:experimentId')
  deleteExperiment(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<void> {
    return this.projectAggregator.deleteLabExperiment(projectId, experimentId);
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Put('project/:projectId/report/v2')
  saveReport2(@Param('projectId', new ParseUUIDPipe()) projectId: string,
              @Body() body: { body: string },
              @BlUploadedFiles() files: BlFile[] = []): Promise<void> {
    const createReportDto: CnCreateReportWithConfigDto
      = ClCoreJsonConvert.deserializeObject(JSON.parse(body.body), CnCreateReportWithConfigDto);
    return this.projectAggregator.createLabReport(createReportDto, projectId, files);
  }

  @Delete('project/:projectId/report/:reportId')
  deleteReport(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('reportId', new ParseUUIDPipe()) reportId: string): Promise<void> {
    return this.projectAggregator.deleteLabReport(projectId, reportId);
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

  /////////////////////////////// SYNCHRONIZATION ///////////////////////////////
  // those routes does not require user authentication because they are called by the lab server and are just get
  @CnLabRobotAuthentication()
  @Get('project/all-trees')
  async getAllProjectTrees(): Promise<CnProjectTreeDTO[]> {
    const projects = await this.labInstanceAggregator.getCurrentLabInstanceProjects();
    return CnProjectDtoHelper.convertToProjectTreeDtoList(projects);
  }

  @CnLabRobotAuthentication()
  @Get('user')
  getAllLabUsers(): Promise<CnExternalLabUser[]> {
    return this.labInstanceAggregator.getCurrentLabInstanceSharedUsers();
  }
}
