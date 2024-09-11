import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UseInterceptors
} from '@nestjs/common';
import { CnProject, CnProjectWithFolder } from './cn-projects/cn-project.entity';
import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlRichTextContent,
  BlRichTextUploadedImageResponse,
  BlRichTextUploadFileResponse,
  BlSearchParams,
  BlUploadedFile
} from '@monorepo/back-core-lib';
import { ClPage, ClPageI } from '@monorepo/core-lib';
import { CnProjectAggregateService } from './cn-project-aggregate.service';
import { CnProjectStorageLocationDTO, CnSaveProjectDTO } from './cn-projects/cn-project.dto';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnProjectComment } from '../cn-project-comment/cn-project-comment.entity';
import { CnComment, CnNewCommentDTO } from '../cn-core/model/entities/cn-comment.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CnProjectUser } from './cn-project-user/cn-project-user.entity';
import { CnActivity } from '../cn-activity/cn-activity.entity';
import { CnBucketLocationDTO } from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnProjectDocument } from './cn-project-documents/cn-project-document.entity';
import {
  CnConstellabDocumentDTO,
  CnProjectDocumentPreviewDTO,
  CnProjectStorageUsageDTO
} from './cn-project-documents/cn-project-document-dto.class';
import { CnFolderHierarchy, CnFolderHierarchyWithChildren } from './cn-folder-hierarchies/cn-folder-hierarchy.entity';


@Controller('projects')
export class CnProjectsController {

  constructor(private projectAggregate: CnProjectAggregateService) {
  }

  @Post()
  create(@Body(new BlParsePipe(CnSaveProjectDTO)) project: CnSaveProjectDTO): Promise<CnProjectWithFolder> {
    return this.projectAggregate.createRootProject(project);
  }

  @Post(':id/sub-project')
  createSubProject(@Param('id', ParseUUIDPipe) id: string,
                   @Body(new BlParsePipe(CnSaveProjectDTO)) workPackage: CnSaveProjectDTO): Promise<CnProjectWithFolder> {
    return this.projectAggregate.createSubProject(workPackage, id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string,
         @Body(new BlParsePipe(CnSaveProjectDTO)) project: CnSaveProjectDTO): Promise<CnProjectWithFolder> {
    return this.projectAggregate.updateProject(id, project);
  }

  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.projectAggregate.deleteProject(id);
  }

  /**
   * return the list of project created by the current user with pagination
   */
  @Get('current')
  public getCurrentProjects(@Query('page', ParseIntPipe) page: number,
                            @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnFolderHierarchy>> {
    return this.projectAggregate.getCurrentRootFolders(page, size);
  }

  // TODO type de retour a changé
  @Get('current-space')
  async getByCurrentSpace(@Query('page', ParseIntPipe) page: number,
                          @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnFolderHierarchy>> {
    return await this.projectAggregate.getByCurrentSpace(page, size);
  }

  // TODO type de retour a changé
  @Post('current-space/search')
  async searchInCurrentSpace(@Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                             @Query('page', ParseIntPipe) page: number,
                             @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnFolderHierarchy>> {
    return await this.projectAggregate.searchInCurrentSpace(searchParam, page, size);
  }

  @Put(':id/share/:groupId')
  shareProject(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('groupId', new ParseUUIDPipe()) groupId: string): Promise<CnUser[]> {
    return this.projectAggregate.shareFolder(id, groupId);
  }

  @Delete(':id/unshare/:userId')
  unshareProject(@Param('id', new ParseUUIDPipe()) id: string,
                 @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.projectAggregate.unshareProject(id, userId);
  }

  /**
   * Return a simplified project tree for an object (project, experiment, report)
   */
  @Get('tree/:id')
  async getProjectTree(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnFolderHierarchy> {
    return await this.projectAggregate.getFolderObjectTree(id);
  }

  @Post(':id/children/paginated')
  getChildrenPaginated(@Param('id', new ParseUUIDPipe()) id: string,
                       @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                       @Query('page', new ParseIntPipe()) page: number,
                       @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnFolderHierarchy>> {
    return this.projectAggregate.getChildrenPaginated(id, searchParam, page, size);
  }

  @Get(':id/ancestors')
  getProjectWithAncestors(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnFolderHierarchy[]> {
    return this.projectAggregate.getFolderAncestors(id);
  }

  @Get(':id/users')
  getUsersOfProject(@Param('id', ParseUUIDPipe) id: string): Promise<CnUser[]> {
    return this.projectAggregate.getUsersOfProject(id);
  }

  @Get(':id/users/search/name/:name?')
  searchProjectUsersByName(@Param('id', ParseUUIDPipe) id: string,
                           @Param('name') name: string,
                           @Query('page', new ParseIntPipe()) page: number,
                           @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnUser>> {
    return this.projectAggregate.searchProjectUsersByName(id, name, page, size);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CnProject> {
    return this.projectAggregate.findProject(id);
  }

  @Put(':id/leader/:leaderId')
  updateLeader(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('leaderId', new ParseUUIDPipe()) leaderId: string): Promise<CnProject> {
    return this.projectAggregate.updateProjectLeader(id, leaderId);
  }

  /////////////////////////////////// FOLDER HIERARCHY //////////////////////////////////////


  /////////////////////////////////// DESCRIPTION //////////////////////////////////////

  @Get(':id/description')
  getDescription(@Param('id', ParseUUIDPipe) id: string): Promise<BlRichTextContent> {
    return this.projectAggregate.getDescription(id);
  }

  @Put(':id/description')
  updateDescription(@Param('id', new ParseUUIDPipe()) id: string,
                    @Body() description: BlRichTextContent): Promise<void> {
    return this.projectAggregate.updateDescription(id, description);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put(':projectId/description/image')
  saveDescriptionImage(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadedImageResponse> {
    return this.projectAggregate.saveDescriptionImage(projectId, file);
  }

  /**
   * Return an image of a comment
   * Use documentName(*) to catch all the documentName (including slashes)
   */
  @Get(':projectId/description/image/:documentName(*)')
  public async getDescriptionImage(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                                   @Param('documentName') documentName: string,
                                   @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getDescriptionImage(projectId, documentName);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  /////////////////////////////// CHAT ///////////////////////////////////////////
  @Get('chat/folder-tree')
  getChatFolders(): Promise<CnFolderHierarchyWithChildren[]> {
    return this.projectAggregate.getChatFolders();
  }

  /////////////////////////////// COMMENTS ///////////////////////////////////////////

  @Put(':id/chat/:enabled')
  activateChat(@Param('id', ParseUUIDPipe) id: string,
               @Param('enabled', ParseBoolPipe) enabled: boolean): Promise<CnProject> {
    return this.projectAggregate.activateChat(id, enabled);
  }


  @UseInterceptors(FileInterceptor('file'))
  @Put(':projectId/comment/image')
  saveCommentImage(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                   @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadedImageResponse> {
    return this.projectAggregate.saveCommentImage(file, projectId);
  }

  /**
   * Return an image of a comment
   * Use documentName(*) to catch all the documentName (including slashes)
   */
  @Get(':projectId/comment/image/:documentName(*)')
  public async getCommentImage(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                               @Param('documentName') documentName: string,
                               @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getCommentImage(documentName, projectId);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  @Post(':projectId/comment/')
  createProjectComment(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @Body(new BlParsePipe(CnNewCommentDTO)) newComment: CnNewCommentDTO): Promise<CnProjectComment> {
    return this.projectAggregate.createFolderComment(newComment, projectId);
  }

  @Put(':projectId/comment/:commentId')
  updateProjectComment(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @Param('commentId', new ParseUUIDPipe()) commentId: string,
                       @Body() body: any): Promise<CnComment> {
    return this.projectAggregate.updateFolderComment(projectId, commentId, body.content);
  }


  @Get(':projectId/comments')
  getProjectComments(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                     @Query('page', new ParseIntPipe()) page: number,
                     @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnProjectComment>> {
    return this.projectAggregate.getFolderComments(projectId, page, size);
  }

  @Delete(':projectId/comment/:commentId/delete')
  deleteProjectComment(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @Param('commentId', new ParseUUIDPipe()) commentId: string): Promise<void> {
    return this.projectAggregate.deleteFolderComment(projectId, commentId);
  }

  /////////////////////////////// DOCUMENT ///////////////////////////////////////////
  @UseInterceptors(FileInterceptor('file'))
  @Post(':projectId/document')
  async uploadDocument(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @BlUploadedFile() file: BlFile): Promise<CnFolderHierarchy> {
    return this.projectAggregate.uploadDocument(projectId, file);
  }


  /**
   * Return a document
   */
  @Get('document/:documentId/preview/:filename(*)')
  public async previewDocument(@Param('documentId') documentId: string,
                               @Param('filename') _: string,
                               @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getUploadedDocument(documentId);
    BlResponseHelper.setFileResponse(response, file);
  }

  @Get('document/:documentId/download/:filename(*)')
  public async downloadDocument(@Param('documentId') documentId: string,
                                @Param('filename') _: string): Promise<StreamableFile> {
    const file = await this.projectAggregate.getUploadedDocument(documentId);

    // use as any as this still works
    return BlResponseHelper.getFileResponse(file.file as any);
  }


  @Delete('document/:documentId')
  deleteDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<void> {
    return this.projectAggregate.deleteDocument(documentId);
  }

  @Put('document/:documentId/move-to-trash')
  moveToTrash(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<CnProjectDocument> {
    return this.projectAggregate.moveDocumentToTrash(documentId);
  }

  @Put('document/:documentId/restore-from-trash')
  restoreDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<CnProjectDocument> {
    return this.projectAggregate.restoreDocumentFromTrash(documentId);
  }

  @Put(':projectId/empty-trash')
  emptyTrash(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<void> {
    return this.projectAggregate.emptyTrash(projectId);
  }

  @Get(':projectId/document/trashed')
  public getTrashedDocumentByProject(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                                     @Query('page', ParseIntPipe) page: number,
                                     @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnProjectDocument>> {
    return this.projectAggregate.getDocumentsByFolder(projectId, true, page, size);
  }

  @Put('document/:documentId/rename')
  public renameDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                        @Body() name: { name: string }): Promise<CnProjectDocument> {
    return this.projectAggregate.renameDocument(documentId, name.name);
  }

  @Put('document/:documentId/move/:projectId')
  public moveDocumentToProject(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                               @Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<CnProjectDocument> {
    return this.projectAggregate.moveDocumentToFolder(documentId, projectId);
  }

  ////////////////////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////////////
  @Post(':projectId/constellab-document')
  public createConstellabDocument(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                                  @Body() name: { name: string }): Promise<CnConstellabDocumentDTO> {
    return this.projectAggregate.createConstellabDocument(projectId, name.name);
  }

  @Put('constellab-document/:documentId')
  public updateConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                                  @Body() body: BlRichTextContent): Promise<CnConstellabDocumentDTO> {
    return this.projectAggregate.updateConstellabDocument(documentId, body);
  }

  @Get('constellab-document/:documentId')
  public getConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<CnConstellabDocumentDTO> {
    return this.projectAggregate.getConstellabDocument(documentId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('constellab-document/:documentId/image')
  async uploadImageToConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                                        @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadedImageResponse> {
    return this.projectAggregate.uploadImageToConstellabDocument(documentId, file);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('constellab-document/:documentId/file')
  async uploadFileToConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                                       @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadFileResponse> {
    return this.projectAggregate.uploadFileToConstellabDocument(documentId, file);
  }

  @Get('constellab-document/:documentId/file/:documentName(*)')
  public async getConstellabDocumentImage(@Param('documentId') documentId: string,
                                          @Param('documentName') documentName: string,
                                          @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getConstellabDocumentContentDocument(documentId, documentName);
    BlResponseHelper.setFileResponse(response, file);
  }

  @Post('migrate-document')
  public async migrateDocuments(): Promise<any> {
    await this.projectAggregate.migrateDocuments();
  }

  ////////////////////////////////////////////// DOCUMENT PREVIEW  /////////////////////////////////////////////

  @Post('document/:documentId/preview-token')
  public async generatePreviewToken(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<CnProjectDocumentPreviewDTO> {
    return this.projectAggregate.generatePreviewToken(documentId);
  }

  @BlPublic()
  @Get('document/preview/:token')
  public async getDocumentPreview(@Param('token') token: string,
                                  @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getDocumentByPreviewToken(token);
    BlResponseHelper.setFileResponse(response, file);
  }


  /////////////////////////////// Project Bucket ///////////////////////////////////////////
  @Post(':projectId/storage')
  createProjectBucket(@Body() createProjectBucketDto: CnProjectStorageLocationDTO,
                      @Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<CnProjectStorageLocationDTO> {
    return this.projectAggregate.createProjectBucket(projectId, createProjectBucketDto);
  }

  @Get(':projectId/storage')
  getProjectStorage(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<CnProjectStorageLocationDTO> {
    return this.projectAggregate.getProjectStorage(projectId);
  }

  @Get('storage/buckets')
  findAccessibleProjectBucketLocation(@Query('page', ParseIntPipe) page: number,
                                      @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnBucketLocationDTO>> {
    return this.projectAggregate.findAccessibleProjectBucketLocation(page, size);
  }

  @Get(':projectId/storage/size')
  getStorageSizeByProjects(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<CnProjectStorageUsageDTO> {
    return this.projectAggregate.getStorageSizeByFolder(projectId);
  }

  /////////////////////////////// Project user ///////////////////////////////////////////

  @Get(':projectId/user-config')
  getProjectUserConfig(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<CnProjectUser> {
    return this.projectAggregate.getCurrentUserRootFolderConfig(projectId);
  }

  @Put(':projectId/user-config')
  updateProjectUserConfig(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                          @Body() body: CnProjectUser): Promise<CnProjectUser> {
    return this.projectAggregate.updateRootProjectCurrentUserConfig(projectId, body);
  }

  /////////////////////////////// Activity ///////////////////////////////////////////

  @Post(':projectId/activity')
  async searchActivity(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                       @Query('page', ParseIntPipe) page: number,
                       @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnActivity>> {
    return await this.projectAggregate.searchFolderActivity(projectId, searchParam, page, size);
  }
}
