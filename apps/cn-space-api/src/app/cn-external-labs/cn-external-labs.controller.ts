import {
  BlCredentials,
  BlDtoHelper,
  BlFile,
  BlParseEnumPipe,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlSearchParams,
  BlUploadedFile,
  BlUploadedFiles,
} from '@monorepo/back-core-lib';
import { ClCoreJsonConvert, ClPage, ClPageI } from '@monorepo/core-lib';
import { TeRichTextBlockModificationsDTO, TeRichTextDTO, TeRichTextHelper } from '@monorepo/te-text-editor';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { CnExternalCheckCredentialResponse } from '../cn-auth/cn-auth.service';
import {
  CnLabAllowDev,
  CnLabGuard,
  CnLabRobotAuthentication,
} from '../cn-core/decorators/cn-lab-guard.decorator';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import {
  CnExternalLabSyncedObjectDTO,
  CnExternalLabUser,
} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import { CnDocument } from '../cn-folders-aggregate/cn-documents/cn-document.entity';
import { CnDocumentAggregateService } from '../cn-folders-aggregate/cn-documents/cn-document-aggregate.service';
import { CnDocumentUploadOverrideMode } from '../cn-folders-aggregate/cn-documents/cn-document-dto.class';
import { CnFolderAggregateService } from '../cn-folders-aggregate/cn-folder-aggregate.service';
import { CnFolderUserDTO } from '../cn-folders-aggregate/cn-folder-user/cn-folder-user.dto';
import { CnRootFolderUserRole } from '../cn-folders-aggregate/cn-folder-user/cn-folder-user.entity';
import { CnSaveFolderDTO } from '../cn-folders-aggregate/cn-folders/cn-folder.dto';
import { CnFolderWithHierarchy } from '../cn-folders-aggregate/cn-folders/cn-folder.entity';
import { CnTag } from '../cn-folders-aggregate/cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';
import { CnHierarchyObjectTag } from '../cn-folders-aggregate/cn-hierarchy-object-tags/cn-hierarchy-object-tag.entity';
import {
  CnFolderDtoHelper,
  CnLabFolderDTO,
} from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.dto';
import { CnHierarchyObject } from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectAggregateService } from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object-aggregate.service';
import { CnCreateNoteWithConfigDto } from '../cn-folders-aggregate/cn-notes/cn-note.dto';
import { CnNoteAggregateService } from '../cn-folders-aggregate/cn-notes/cn-note-aggregate.service';
import { CnShareResourceRequestDTO } from '../cn-folders-aggregate/cn-resources/cn-resource.dto';
import { CnResourceAggregateService } from '../cn-folders-aggregate/cn-resources/cn-resource-aggregate.service';
import { CnCreateLabScenarioDto } from '../cn-folders-aggregate/cn-scenarios/cn-scenario.dto';
import { CnScenarioAggregateService } from '../cn-folders-aggregate/cn-scenarios/cn-scenario-aggregate.service';
import { CnGroup } from '../cn-groups/cn-group.entity';
import { CnGroupsAggregateService } from '../cn-groups/cn-groups-aggregate.service';
import { CnLabFolderAggregateService } from '../cn-lab-folder-aggregate/cn-lab-folder-aggregate.service';
import { CnLabStartDTO } from '../cn-labs/cn-lab.dto';
import { CnLabAggregateService } from '../cn-labs/cn-lab-aggregate.service';
import { CnLabSendMailDto, CnLabSendMailToMailsDto } from '../cn-labs/mail/cn-lab-mail.dto';
import { CnLabMailService } from '../cn-labs/mail/cn-lab-mail.service';
import { CnLabNotificationCreateDTO } from '../cn-labs/notification/cn-lab-notification.dto';
import { CnLabNotificationService } from '../cn-labs/notification/cn-lab-notification.service';
import { CnUser } from '../cn-users/cn-user.entity';
import {
  CnExternalLabTagsDTO,
  CnRichTextCompareRequestDTO,
  CnRichTextUndoRequestDTO,
} from './cn-external-labs.dto';

/**
 * Specific controller for route called by the lab servers. These routes are not called by a user
 */
@CnLabGuard()
@Controller('external-labs')
export class CnExternalLabsController {
  constructor(
    private labAggregator: CnLabAggregateService,
    private folderAggregateService: CnFolderAggregateService,
    private hierarchyObjectAggregateService: CnHierarchyObjectAggregateService,
    private labFolderAggregateService: CnLabFolderAggregateService,
    private resourceAggregateService: CnResourceAggregateService,
    private scenarioAggregateService: CnScenarioAggregateService,
    private noteAggregateService: CnNoteAggregateService,
    private documentAggregateService: CnDocumentAggregateService,
    private labMailService: CnLabMailService,
    private labNotificationService: CnLabNotificationService,
    private configService: CnCoreConfigService,
    private groupsAggregateService: CnGroupsAggregateService
  ) {}

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
  @CnLabAllowDev()
  @CnLabRobotAuthentication()
  @Post('check-credentials')
  async checkUserCredentials(@Body() credentials: BlCredentials): Promise<CnExternalCheckCredentialResponse> {
    return this.labAggregator.checkUserCredentials(credentials, false, false);
  }

  /**
   * Check the user credentials without checking captcha nor 2Fa.
   * This route is not supposed to be used for login.
   * @param credentials
   */
  @CnLabAllowDev()
  @CnLabRobotAuthentication()
  @Post('check-credentials-simple')
  async checkUserCredentialsSimple(
    @Body() credentials: BlCredentials
  ): Promise<CnExternalCheckCredentialResponse> {
    return this.labAggregator.checkUserCredentials(credentials, true, true);
  }

  //////////////////////////// SCENARIO ////////////////////////////

  @Put(['folder/:parentFolderId/scenario'])
  saveScenario(
    @Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
    @Body(new BlParsePipe(CnCreateLabScenarioDto)) createLabScenarioDto: CnCreateLabScenarioDto
  ): Promise<CnHierarchyObject> {
    return this.hierarchyObjectAggregateService.saveLabScenario(parentFolderId, createLabScenarioDto);
  }

  @Delete(['folder/:parentFolderId/scenario/:scenarioId'])
  deleteScenario(@Param('scenarioId', new ParseUUIDPipe()) scenarioId: string): Promise<void> {
    return this.hierarchyObjectAggregateService.deleteHierarchyObjectById(scenarioId);
  }

  @Put('folder/:parentFolderId/scenario/:scenarioId/folder/:newParentFolderId')
  moveScenario(
    @Param('parentFolderId', new ParseUUIDPipe()) _: string,
    @Param('scenarioId', new ParseUUIDPipe()) scenarioId: string,
    @Param('newParentFolderId', new ParseUUIDPipe()) newParentFolderId: string
  ): Promise<CnHierarchyObject> {
    return this.hierarchyObjectAggregateService.moveHierarchyObjectToFolder(scenarioId, newParentFolderId);
  }

  @CnLabRobotAuthentication()
  @Get('scenario/sync')
  async getScenarioOfCurrentLab(): Promise<CnExternalLabSyncedObjectDTO[]> {
    return this.scenarioAggregateService.getScenariosOfCurrentLab();
  }

  //////////////////////////// NOTE ////////////////////////////

  @UseInterceptors(FilesInterceptor('files'))
  @Put(['folder/:parentFolderId/note/v2'])
  saveNote(
    @Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
    @Body() body: { body: string },
    @BlUploadedFiles() files: BlFile[] = []
  ): Promise<CnHierarchyObject> {
    const createNoteDto: CnCreateNoteWithConfigDto = ClCoreJsonConvert.deserializeObject(
      JSON.parse(body.body),
      CnCreateNoteWithConfigDto
    );
    return this.hierarchyObjectAggregateService.saveLabNote(createNoteDto, parentFolderId, files);
  }

  @Delete(['folder/:parentFolderId/note/:noteId'])
  deleteNote(@Param('noteId', new ParseUUIDPipe()) noteId: string): Promise<void> {
    return this.hierarchyObjectAggregateService.deleteHierarchyObjectById(noteId);
  }

  @Put(['folder/:parentFolderId/note/:noteId/folder/:newParentFolderId'])
  moveNote(
    @Param('parentFolderId', new ParseUUIDPipe()) _: string,
    @Param('noteId', new ParseUUIDPipe()) noteId: string,
    @Param('newParentFolderId', new ParseUUIDPipe()) newParentFolderId: string
  ): Promise<CnHierarchyObject> {
    return this.hierarchyObjectAggregateService.moveHierarchyObjectToFolder(noteId, newParentFolderId);
  }

  @CnLabRobotAuthentication()
  @Get('note/sync')
  async getNoteOfCurrentLab(): Promise<CnExternalLabSyncedObjectDTO[]> {
    return this.noteAggregateService.getNotesOfCurrentLab();
  }

  //////////////////////////// RESOURCE ////////////////////////////

  @Put(['folder/:parentFolderId/resource'])
  saveResource(
    @Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
    @Body() body: CnShareResourceRequestDTO
  ): Promise<CnHierarchyObject> {
    return this.hierarchyObjectAggregateService.shareResourceToFolder(parentFolderId, body);
  }

  //////////////////////////// DOCUMENT ////////////////////////////

  /**
   * Upload a document to a folder
   * @param parentFolderId The folder to upload the document to
   * @param file The file to upload
   * @param overrideMode How to handle existing files with the same name
   */
  @UseInterceptors(FileInterceptor('file'))
  @Put(['folder/:parentFolderId/document/upload/:overrideMode'])
  @CnLabAllowDev()
  uploadDocument(
    @Param('parentFolderId', new ParseUUIDPipe()) parentFolderId: string,
    @BlUploadedFile() file: BlFile,
    @Param('overrideMode') overrideMode: CnDocumentUploadOverrideMode
  ): Promise<CnHierarchyObject> {
    return this.documentAggregateService.uploadDocument(parentFolderId, file, overrideMode);
  }

  /**
   * Download a document
   * @param documentId The ID of the document to download
   * @param filename The filename (for URL readability, not used in logic)
   * @param response Express response object
   */
  @CnLabAllowDev()
  @Get(['document/:documentId/download/:filename(*)'])
  async downloadDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Param('filename') _: string,
    @Res() response: Response
  ): Promise<void> {
    const file = await this.documentAggregateService.getUploadedDocument(documentId);
    BlResponseHelper.setFileResponse(response, file, 'download');
  }

  /**
   * Rename a document
   * @param documentId The ID of the document to rename
   * @param name The new name for the document
   */
  @CnLabAllowDev()
  @Put(['document/:documentId/rename'])
  renameDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Body() name: { name: string }
  ): Promise<CnDocument> {
    return this.documentAggregateService.renameDocument(documentId, name.name);
  }

  /**
   * Delete a document by moving it to trash
   * @param documentId The ID of the document to delete
   */
  @CnLabAllowDev()
  @Delete(['document/:documentId'])
  async deleteDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string
  ): Promise<CnHierarchyObject> {
    return this.hierarchyObjectAggregateService.moveToTrash(documentId);
  }

  /////////////////////////////// SYNCHRONIZATION ///////////////////////////////
  // those routes does not require user authentication
  // because they are called by the lab server and are just get
  @CnLabAllowDev()
  @CnLabRobotAuthentication()
  @Get(['folder/all-trees'])
  async getAllFolderTrees(): Promise<CnLabFolderDTO[]> {
    const folders = await this.labFolderAggregateService.getCurrentLabFolders();
    return CnFolderDtoHelper.convertToFolderTreeDtoList(folders);
  }

  @CnLabAllowDev()
  @CnLabRobotAuthentication()
  @Get(['folder/:id/root-tree'])
  async getRootFolder(@Param('id', new ParseUUIDPipe()) folderId: string): Promise<CnLabFolderDTO> {
    const folder = await this.labFolderAggregateService.getCurrentLabRootFolderById(folderId);
    return CnFolderDtoHelper.convertToLabFolderDto(folder);
  }

  @CnLabAllowDev()
  @CnLabRobotAuthentication()
  @Get('user')
  getAllLabUsers(): Promise<CnExternalLabUser[]> {
    return this.labAggregator.getCurrentLabSharedUsers();
  }

  @CnLabAllowDev()
  @CnLabRobotAuthentication()
  @Get('user/:id')
  getUser(@Param('id', new ParseUUIDPipe()) userId: string): Promise<CnExternalLabUser> {
    return this.labAggregator.getUserInfoForCurrentLab(userId);
  }

  //////////////////////////// GROUPS //////////////////////////

  @CnLabAllowDev()
  @Get('groups/all')
  getCurrentLabAllGroups(): Promise<CnGroup[]> {
    return this.groupsAggregateService.getCurrentLabAllGroups();
  }

  //////////////////////////// FOLDER //////////////////////////
  @CnLabAllowDev()
  @Get('folder/:id')
  getFolder(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnHierarchyObject[]> {
    return this.hierarchyObjectAggregateService.getObjectAncestors(id);
  }

  /**
   * Get paginated children of a folder with search capabilities
   * @param id The folder ID to get children from
   * @param searchParam Search and filter parameters
   * @param page Page number (0-indexed)
   * @param size Page size
   */
  @CnLabAllowDev()
  @Post('folder/:id/children/paginated')
  getChildrenPaginated(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    return this.hierarchyObjectAggregateService.searchVisibleInFolderChildren(id, searchParam, page, size);
  }

  @CnLabAllowDev()
  @Post('folder')
  create(@Body(new BlParsePipe(CnSaveFolderDTO)) folder: CnSaveFolderDTO): Promise<CnFolderWithHierarchy> {
    return this.folderAggregateService.createRootFolder(folder);
  }

  @CnLabAllowDev()
  @Post('folder/:id')
  createSubFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new BlParsePipe(CnSaveFolderDTO)) workPackage: CnSaveFolderDTO
  ): Promise<CnFolderWithHierarchy> {
    return this.folderAggregateService.createSubFolder(workPackage, id);
  }

  @CnLabAllowDev()
  @Delete('folder/:id')
  async deleteFolder(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.hierarchyObjectAggregateService.moveToTrash(id);
  }

  @CnLabAllowDev()
  @Put('folder/:id')
  updateFolder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new BlParsePipe(CnSaveFolderDTO)) folder: CnSaveFolderDTO
  ): Promise<CnFolderWithHierarchy> {
    return this.folderAggregateService.updateFolder(id, folder);
  }

  /**
   * Share a folder to a group (team or user)
   * @param id The ID of the folder to share
   * @param groupOrUserId The ID of the group or user to share the folder with
   * @param role The role to assign to the group
   * @returns All the users shared with the folder
   */
  @CnLabAllowDev()
  @Put(['folder/:id/share/:groupOrUserId/role/:role', 'folder/:id/share/:groupOrUserId'])
  async shareFolderToGroup(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('groupOrUserId', new ParseUUIDPipe()) groupOrUserId: string,
    @Param('role', new BlParseEnumPipe(CnRootFolderUserRole)) role?: CnRootFolderUserRole
  ): Promise<CnFolderUserDTO[]> {
    const folderUsers = await this.folderAggregateService.shareFolder(
      id,
      groupOrUserId,
      role ?? CnRootFolderUserRole.USER
    );
    return BlDtoHelper.listToDto(CnFolderUserDTO, folderUsers);
  }

  @CnLabAllowDev()
  @Delete('folder/:id/share/:userId')
  async unshareFolderToGroup(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string
  ): Promise<void> {
    await this.folderAggregateService.unshareFolder(id, userId);
  }

  @CnLabAllowDev()
  @Put('folder/:id/user/:userId/role/:role')
  async updateFolderUserRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('role', new BlParseEnumPipe(CnRootFolderUserRole)) role: CnRootFolderUserRole
  ): Promise<void> {
    await this.folderAggregateService.updateFolderUserRole(id, userId, role);
  }

  @CnLabAllowDev()
  @Put('folder/:id/lab/current')
  async shareFolderWithCurrentLab(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabFolderDTO> {
    const folder = await this.labFolderAggregateService.shareFolderWithCurrentLab(id);
    return CnFolderDtoHelper.convertToLabFolderDto(folder);
  }

  @CnLabAllowDev()
  @Get('folder/:id/users')
  async getFolderUsers(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnUser[]> {
    return this.folderAggregateService.getUsersOfFolder(id);
  }

  @CnLabAllowDev()
  @Get('folder/user/current')
  async getRootFoldersOfCurrentUser(): Promise<CnHierarchyObject[]> {
    return this.folderAggregateService.getAllCurrentRootFolders();
  }

  //////////////////////////// HIERARCHY OBJECT TAG //////////////////////////

  @CnLabAllowDev()
  @Post('hierarchyObject/:hierarchyObjectId/tags/multiple')
  async createTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Body() tags: CnExternalLabTagsDTO
  ): Promise<CnHierarchyObjectTag[]> {
    return this.hierarchyObjectAggregateService.createHierarchyObjectTags(hierarchyObjectId, tags.tags);
  }

  @CnLabAllowDev()
  @Post('hierarchyObject/:hierarchyObjectId/tags/createOrReplace')
  async createOrReplaceTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Body() tags: CnExternalLabTagsDTO
  ): Promise<CnHierarchyObjectTag[]> {
    return this.hierarchyObjectAggregateService.createOrReplace(hierarchyObjectId, tags.tags);
  }

  @CnLabAllowDev()
  @Post('hierarchyObject/:hierarchyObjectId/tags/delete')
  async deleteTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Body() tags: CnExternalLabTagsDTO
  ): Promise<void> {
    return this.hierarchyObjectAggregateService.deleteHierarchyObjectTags(hierarchyObjectId, tags.tags);
  }

  @CnLabAllowDev()
  @Get('hierarchyObject/:hierarchyObjectId/tags')
  async getTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnTag>> {
    return this.hierarchyObjectAggregateService.getHierarchyObjectTagsPaginated(
      hierarchyObjectId,
      page,
      size
    );
  }

  //////////////////////////// OTHERS //////////////////////////

  // Public route that return the new list of modifications after a rich text content modification
  @BlPublic()
  @Post('rich-text/compare')
  compareRichTexts(@Body() body: CnRichTextCompareRequestDTO): TeRichTextBlockModificationsDTO {
    return TeRichTextHelper.compareRichTexts(
      body.oldContent,
      body.newContent,
      body.oldModifications,
      body.userId
    );
  }

  // Public route that return the new content after an undo operation based on modifications
  @BlPublic()
  @Post('rich-text/previous-version')
  getRichTextPreviousVersion(@Body() body: CnRichTextUndoRequestDTO): TeRichTextDTO {
    return TeRichTextHelper.getRichTextPreviousVersion(body.content, body.modifications, body.modificationId);
  }

  /**
   * Route to send an email from the lab
   * @param body
   */
  @CnLabAllowDev()
  @Post('send-mail')
  sendMail(@Body() body: CnLabSendMailDto): Promise<void> {
    return this.labMailService.sendMailFromLab(CnCurrentUserHelper.getAndCheckCurrentLab(), body);
  }

  @CnLabAllowDev()
  @Post('send-mail-to-mails')
  sendMailToMails(@Body() body: CnLabSendMailToMailsDto): Promise<void> {
    return this.labMailService.sendMailToMailsFromLab(CnCurrentUserHelper.getAndCheckCurrentLab(), body);
  }

  @CnLabAllowDev()
  @Post('send-notification')
  sendNotification(@Body() notification: CnLabNotificationCreateDTO): Promise<void> {
    return this.labNotificationService.sendNotificationFromCurrentLab(notification);
  }

  @CnLabAllowDev()
  @CnLabRobotAuthentication()
  @Get('reflex-access-token')
  getReflexAccessToken(): { reflexAccessToken: string } {
    return { reflexAccessToken: this.configService.getReflexAccessToken() };
  }
}
