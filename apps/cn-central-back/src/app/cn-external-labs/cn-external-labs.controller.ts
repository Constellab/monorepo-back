import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseInterceptors } from '@nestjs/common';
import { CnLabGuard, CnLabRobotAuthentication } from '../cn-core/decorators/cn-lab-guard.decorator';
import { BlCredentials, BlFile, BlParsePipe, BlUploadedFiles } from '@monorepo/back-core-lib';
import { CnCreateLabExperimentDto } from '../cn-folders-aggregate/cn-experiments/cn-experiment.dto';
import { CnCreateReportWithConfigDto } from '../cn-folders-aggregate/cn-reports/cn-report.dto';
import { CnLabInstanceStartDTO } from '../cn-lab-instances/cn-lab-instance.dto';
import { CnFolderAggregateService } from '../cn-folders-aggregate/cn-folder-aggregate.service';
import { CnLabInstanceSendMailDto } from '../cn-lab-instances/mail/cn-lab-instance-mail.dto';
import { CnLabMailService } from '../cn-lab-instances/mail/cn-lab-mail.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnLabInstanceAggregateService } from '../cn-lab-instances/cn-lab-instance-aggregate.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClCoreJsonConvert } from '@monorepo/core-lib';
import { CnExternalLabUser } from '../cn-external-lab-api/model/cn-external-lab-api.class';
import { CnExternalCheckCredentialResponse } from '../cn-auth/cn-auth.service';
import { CnLabFolderAggregateService } from '../cn-lab-folder-aggregate/cn-lab-folder-aggregate.service';
import {
  CnFolderDtoHelper,
  CnLabFolderDTO
} from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.dto';
import { CnHierarchyObjectEntity } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.entity';

/**
 * Specific controller for route called by the lab servers. These routes are not called by a user
 */
@CnLabGuard()
@Controller('external-labs')
export class CnExternalLabsController {

  constructor(private labInstanceAggregator: CnLabInstanceAggregateService,
              private folderAggregateService: CnFolderAggregateService,
              private labFolderAggregateService: CnLabFolderAggregateService,
              private labInstanceMailService: CnLabMailService) {
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

  @Put('project/:parentFolderId/experiment')
  createOrUpdateExperiment(
    @Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
    @Body(new BlParsePipe(CnCreateLabExperimentDto)) createLabExperimentDto: CnCreateLabExperimentDto): Promise<void> {
    return this.folderAggregateService.createLabExperiment(parentFolderId, createLabExperimentDto);
  }

  @Delete('project/:parentFolderId/experiment/:experimentId')
  deleteExperiment(
    @Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
    @Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<void> {
    return this.folderAggregateService.deleteLabExperiment(parentFolderId, experimentId);
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Put('project/:parentFolderId/report/v2')
  saveReport2(@Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
              @Body() body: { body: string },
              @BlUploadedFiles() files: BlFile[] = []): Promise<void> {
    const createReportDto: CnCreateReportWithConfigDto
      = ClCoreJsonConvert.deserializeObject(JSON.parse(body.body), CnCreateReportWithConfigDto);
    return this.folderAggregateService.createLabReport(createReportDto, parentFolderId, files);
  }

  @Delete('project/:parentFolderId/report/:reportId')
  deleteReport(
    @Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
    @Param('reportId', new ParseUUIDPipe()) reportId: string): Promise<void> {
    return this.folderAggregateService.deleteReportFromLab(parentFolderId, reportId);
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
  async getAllFolderTrees(): Promise<CnLabFolderDTO[]> {
    const folders = await this.labFolderAggregateService.getCurrentLabInstanceFolders();
    return CnFolderDtoHelper.convertToFolderTreeDtoList(folders as CnHierarchyObjectEntity[]);
  }

  @CnLabRobotAuthentication()
  @Get('project/:id/root-tree')
  async getRootFolder(@Param('id', new ParseUUIDPipe()) folderId: string): Promise<CnLabFolderDTO> {
    const folder = await this.labFolderAggregateService.getCurrentLabInstanceRootFolderById(folderId);
    return CnFolderDtoHelper.convertToLabFolderDto(folder as CnHierarchyObjectEntity);
  }

  @CnLabRobotAuthentication()
  @Get('user')
  getAllLabUsers(): Promise<CnExternalLabUser[]> {
    return this.labInstanceAggregator.getCurrentLabInstanceSharedUsers();
  }
}
