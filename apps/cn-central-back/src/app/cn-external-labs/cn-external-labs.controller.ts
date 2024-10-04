import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseInterceptors } from '@nestjs/common';
import { CnLabGuard, CnLabRobotAuthentication } from '../cn-core/decorators/cn-lab-guard.decorator';
import { BlCredentials, BlFile, BlParsePipe, BlUploadedFiles } from '@monorepo/back-core-lib';
import { CnCreateLabScenarioDto } from '../cn-folders-aggregate/cn-scenarios/cn-scenario.dto';
import { CnCreateNoteWithConfigDto } from '../cn-folders-aggregate/cn-notes/cn-note.dto';
import { CnLabStartDTO } from '../cn-labs/cn-lab.dto';
import { CnFolderAggregateService } from '../cn-folders-aggregate/cn-folder-aggregate.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnLabAggregateService } from '../cn-labs/cn-lab-aggregate.service';
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
import { CnLabMailService } from '../cn-labs/mail/cn-lab-mail.service';
import { CnLabSendMailDto } from '../cn-labs/mail/cn-lab-mail.dto';

/**
 * Specific controller for route called by the lab servers. These routes are not called by a user
 */
@CnLabGuard()
@Controller('external-labs')
export class CnExternalLabsController {

  constructor(private labAggregator: CnLabAggregateService,
              private folderAggregateService: CnFolderAggregateService,
              private labFolderAggregateService: CnLabFolderAggregateService,
              private labMailService: CnLabMailService) {
  }

  // route called on the lab start
  @CnLabRobotAuthentication()
  @Put('start')
  onLabStart(@Body() labStart: CnLabStartDTO): Promise<void> {
    return this.labAggregator.registerLabConfig(labStart);
  }

  /**
   * Check user credentials for login
   * @param credentials
   */
  @CnLabRobotAuthentication()
  @Post('check-credentials')
  async checkUserCredentials(@Body() credentials: BlCredentials): Promise<CnExternalCheckCredentialResponse> {
    return this.labAggregator.checkUserCredentials(credentials, false, false);
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
    return this.labAggregator.checkUserCredentials(credentials, true, true);
  }

  // TODO remove project routes once all lab are on v0.10.0
  @Put(['project/:parentFolderId/experiment', 'folder/:parentFolderId/scenario'])
  createOrUpdateScenario(
    @Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
    @Body(new BlParsePipe(CnCreateLabScenarioDto)) createLabScenarioDto: CnCreateLabScenarioDto): Promise<void> {
    return this.folderAggregateService.createLabScenario(parentFolderId, createLabScenarioDto);
  }

  @Delete(['project/:parentFolderId/experiment/:scenarioId', 'folder/:parentFolderId/scenario/:scenarioId'])
  deleteScenario(
    @Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
    @Param('scenarioId', new ParseUUIDPipe()) scenarioId: string): Promise<void> {
    return this.folderAggregateService.deleteLabScenario(parentFolderId, scenarioId);
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Put(['project/:parentFolderId/report/v2', 'folder/:parentFolderId/note/v2'])
  saveNote2(@Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
              @Body() body: { body: string },
              @BlUploadedFiles() files: BlFile[] = []): Promise<void> {
    const createNoteDto: CnCreateNoteWithConfigDto
      = ClCoreJsonConvert.deserializeObject(JSON.parse(body.body), CnCreateNoteWithConfigDto);
    return this.folderAggregateService.createLabNote(createNoteDto, parentFolderId, files);
  }

  @Delete(['project/:parentFolderId/report/:noteId', 'folder/:parentFolderId/note/:noteId'])
  deleteNote(
    @Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
    @Param('noteId', new ParseUUIDPipe()) noteId: string): Promise<void> {
    return this.folderAggregateService.deleteNoteFromLab(parentFolderId, noteId);
  }

  /**
   * Route to send an email from the lab
   * @param body
   */
  @Post('send-mail')
  sendMail(@Body() body: CnLabSendMailDto): Promise<void> {
    return this.labMailService.sendMailFromLab(CnCurrentUserHelper.getAndCheckCurrentLab(),
      body);
  }

  /////////////////////////////// SYNCHRONIZATION ///////////////////////////////
  // those routes does not require user authentication because they are called by the lab server and are just get
  @CnLabRobotAuthentication()
  @Get(['project/all-trees', 'folder/all-trees'])
  async getAllFolderTrees(): Promise<CnLabFolderDTO[]> {
    const folders = await this.labFolderAggregateService.getCurrentLabFolders();
    return CnFolderDtoHelper.convertToFolderTreeDtoList(folders as CnHierarchyObjectEntity[]);
  }

  @CnLabRobotAuthentication()
  @Get(['project/:id/root-tree', 'folder/:id/root-tree'])
  async getRootFolder(@Param('id', new ParseUUIDPipe()) folderId: string): Promise<CnLabFolderDTO> {
    const folder = await this.labFolderAggregateService.getCurrentLabRootFolderById(folderId);
    return CnFolderDtoHelper.convertToLabFolderDto(folder as CnHierarchyObjectEntity);
  }

  @CnLabRobotAuthentication()
  @Get('user')
  getAllLabUsers(): Promise<CnExternalLabUser[]> {
    return this.labAggregator.getCurrentLabSharedUsers();
  }
}
