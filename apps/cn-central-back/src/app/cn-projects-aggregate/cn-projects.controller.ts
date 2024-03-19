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
  StreamableFile,
  UseInterceptors
} from '@nestjs/common';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnProjectStatus} from './cn-projects/cn-project-status.enum';
import {CnProjectStatusHistory} from './cn-projects/cn-project-status-history.entity';
import {
  BlFile,
  BlParseEnumPipe,
  BlParsePipe,
  BlResponseHelper,
  BlRichTextContent,
  BlRichTextUploadedImage,
  BlSearchParams,
  BlUploadedFile,
  BlUserCategory
} from '@monorepo/back-core-lib';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CnProjectAggregateService} from './cn-project-aggregate.service';
import {
  CnProjectAncestorTreeDTO,
  CnProjectAncestorType,
  CnProjectDtoHelper,
  CnProjectStorageLocationDTO,
  CnProjectTreeDTO,
  CnSaveProjectDTO
} from './cn-projects/cn-project.dto';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnProjectComment} from '../cn-project-comment/cn-project-comment.entity';
import {CnComment, CnNewComment} from '../cn-core/model/entities/cn-comment.entity';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {CnProjectUser} from './cn-project-user/cn-project-user.entity';
import {CnActivity} from '../cn-activity/cn-activity.entity';
import {CnBucketLocationDTO} from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {CnProjectDocument} from './cn-project-documents/cn-project-document.entity';
import {CnConstellabDocument2} from './cn-project-documents/cn-project-document-dto.class';


@Controller('projects')
export class CnProjectsController {

  constructor(private projectAggregate: CnProjectAggregateService) {
  }

  @Post()
  create(@Body(new BlParsePipe(CnSaveProjectDTO)) project: CnSaveProjectDTO): Promise<CnProject> {
    return this.projectAggregate.createProject(project);
  }

  @Post(':id/sub-project')
  createSubProject(@Param('id', ParseUUIDPipe) id: string,
                   @Body(new BlParsePipe(CnSaveProjectDTO)) workPackage: CnSaveProjectDTO): Promise<CnProject> {
    return this.projectAggregate.createSubProject(workPackage, id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string,
         @Body(new BlParsePipe(CnSaveProjectDTO)) project: CnSaveProjectDTO): Promise<CnProject> {
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
                            @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnProject>> {
    return this.projectAggregate.getCurrentProjects(page, size);
  }

  @Get('current-space')
  async getByCurrentSpace(@Query('page', ParseIntPipe) page: number,
                          @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnProject>> {
    return await this.projectAggregate.getByCurrentSpace(page, size);
  }

  @Post('current-space/search')
  async searchInCurrentSpace(@Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                             @Query('page', ParseIntPipe) page: number,
                             @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnProject>> {
    return await this.projectAggregate.searchInCurrentSpace(searchParam, page, size);
  }

  @Put(':id/status/:status')
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('status', new BlParseEnumPipe(CnProjectStatus)) status: CnProjectStatus): Promise<CnProject> {
    return this.projectAggregate.updateProjectCurrentStatus(status, id);
  }

  @Put(':id/share/:groupId')
  shareProject(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('groupId', new ParseUUIDPipe()) groupId: string): Promise<CnUser[]> {
    return this.projectAggregate.shareProject(id, groupId);
  }

  @Delete(':id/unshare/:userId')
  unshareProject(@Param('id', new ParseUUIDPipe()) id: string,
                 @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.projectAggregate.unshareProject(id, userId);
  }

  /**
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnProjectStatusHistory[]> {
    return this.projectAggregate.getProjectStatusHistory(id);
  }

  /**
   * Return a simplified project tree for an object (project, experiment, report)
   */
  @Get('tree/:objectType/:id')
  async getProjectTree(@Param('objectType') objectType: CnProjectAncestorType,
                       @Param('id', new ParseUUIDPipe()) id: string): Promise<CnProjectTreeDTO> {
    const project = await this.projectAggregate.getProjectObjectTree(objectType, id);
    return CnProjectDtoHelper.convertToProjectTreeDto(project);
  }

  @Get(':id/children')
  getChildren(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnProject[]> {
    return this.projectAggregate.getChildren(id);
  }

  /**
   * Return a simplified list of ancestor for an object (project, experiment, report) to the main project
   * @param objectType
   * @param id
   */
  @Get('ancestors/:objectType/:id')
  getObjectProjectAncestors(@Param('objectType') objectType: CnProjectAncestorType,
                            @Param('id', new ParseUUIDPipe()) id: string): Promise<CnProjectAncestorTreeDTO[]> {
    return this.projectAggregate.getObjectProjectAncestors(objectType, id);
  }

  @Get(':id/users')
  getUsersOfProject(@Param('id', ParseUUIDPipe) id: string): Promise<CnUser[]> {
    return this.projectAggregate.getUsersOfProject(id);
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

  /////////////////////////////////// DESCRIPTION //////////////////////////////////////

  @Get(':id/description')
  getDescription(@Param('id', ParseUUIDPipe) id: string): Promise<BlRichTextContent> {
    return this.projectAggregate.getDescription(id);
  }

  @Put(':id/description')
  updateDescription(@Param('id', new ParseUUIDPipe()) id: string,
                    @Body() description: BlRichTextContent): Promise<CnProject> {
    return this.projectAggregate.updateDescription(id, description);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put(':projectId/description/image')
  saveDescriptionImage(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadedImage> {
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
    BlResponseHelper.setMessageAndCache(response, file);
  }

  /////////////////////////////// COMMENTS ///////////////////////////////////////////

  @UseInterceptors(FileInterceptor('file'))
  @Put(':projectId/comment/image')
  saveCommentImage(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                   @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadedImage> {
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
    BlResponseHelper.setMessageAndCache(response, file);
  }

  @Post(':projectId/comment/')
  createProjectComment(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @Body(new BlParsePipe(CnNewComment)) newComment: CnNewComment): Promise<CnProjectComment> {
    return this.projectAggregate.createProjectComment(newComment, projectId);
  }

  //Edit comment content
  @Put(':projectId/comment/:commentId')
  updateProjectComment(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @Param('commentId', new ParseUUIDPipe()) commentId: string,
                       @Body() body: any): Promise<CnComment> {
    return this.projectAggregate.updateProjectComment(projectId, commentId, body.content);
  }


  @Get(':projectId/comments')
  getProjectComments(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                     @Query('page', new ParseIntPipe()) page: number,
                     @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnProjectComment>> {
    return this.projectAggregate.getProjectComments(projectId, page, size);
  }

  @Delete(':projectId/comment/:commentId/delete')
  deleteProjectComment(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @Param('commentId', new ParseUUIDPipe()) commentId: string): Promise<void> {
    return this.projectAggregate.deleteProjectComment(projectId, commentId);
  }

  /////////////////////////////// DOCUMENT ///////////////////////////////////////////
  @UseInterceptors(FileInterceptor('file'))
  @Post(':projectId/document')
  async uploadDocument(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @BlUploadedFile() file: BlFile): Promise<CnProjectDocument> {
    return this.projectAggregate.uploadDocument(projectId, file);
  }


  /**
   * Return a document
   */
  @Get(':projectId/document/preview/:filename(*)')
  public async previewDocument(@Param('projectId') projectId: string,
                               @Param('filename') filename: string,
                               @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getUploadedDocument(projectId, filename);
    BlResponseHelper.setMessage(response, file);
  }

  @Get(':projectId/document/download/:filename(*)')
  public async downloadDocument(@Param('projectId') projectId: string,
                                @Param('filename') filename: string): Promise<StreamableFile> {
    const file = await this.projectAggregate.getUploadedDocument(projectId, filename);

    return BlResponseHelper.getFileResponse(file);
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

  @Get(':projectId/document')
  public getDocumentsByProject(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                               @Query('page', ParseIntPipe) page: number,
                               @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnProjectDocument>> {
    return this.projectAggregate.getDocumentsByProject(projectId, false, page, size);
  }

  @Get(':projectId/document/trashed')
  public getTrashedDocumentByProject(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                                     @Query('page', ParseIntPipe) page: number,
                                     @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnProjectDocument>> {
    return this.projectAggregate.getDocumentsByProject(projectId, true, page, size);
  }


  @Put('document/:documentId/rename')
  public renameDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                        @Body() name: { name: string }): Promise<CnProjectDocument> {
    return this.projectAggregate.renameDocument(documentId, name.name);
  }

  ////////////////////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////////////
  @Post(':projectId/constellab-document')
  public createConstellabDocument(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                                  @Body() name: { name: string }): Promise<CnConstellabDocument2> {
    return this.projectAggregate.createConstellabDocument(projectId, name.name);
  }

  @Put('constellab-document/:documentId')
  public updateConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                                  @Body() body: BlRichTextContent): Promise<CnConstellabDocument2> {
    return this.projectAggregate.updateConstellabDocument(documentId, body);
  }

  @Get('constellab-document/:documentId')
  public getConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<CnConstellabDocument2> {
    return this.projectAggregate.getConstellabDocument(documentId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('constellab-document/:documentId/image')
  async uploadImageToConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                                        @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadedImage> {
    return this.projectAggregate.uploadImageToConstellabDocument(documentId, file);
  }

  @Get('constellab-document/:documentId/image/:documentName(*)')
  public async getConstellabDocumentImage(@Param('documentId') documentId: string,
                                          @Param('documentName') documentName: string,
                                          @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getConstellabDocumentImage(documentId, documentName);
    BlResponseHelper.setMessage(response, file);
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

  /////////////////////////////// Project user ///////////////////////////////////////////

  @Get(':projectId/user-config')
  getProjectUserConfig(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<CnProjectUser> {
    return this.projectAggregate.getCurrentProjectUserConfig(projectId);
  }

  @Put(':projectId/user-config')
  updateProjectUserConfig(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                          @Body() body: CnProjectUser): Promise<CnProjectUser> {
    return this.projectAggregate.updateCurrentProjectUserConfig(projectId, body);
  }

  /////////////////////////////// Activity ///////////////////////////////////////////

  @Post(':projectId/activity')
  async searchActivity(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                       @Query('page', ParseIntPipe) page: number,
                       @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnActivity>> {
    return await this.projectAggregate.searchProjectActivity(projectId, searchParam, page, size);
  }

  @CnUserCategories(BlUserCategory.ADMIN)
  @Post('experiment-migrate')
  async migrateDocTextEditor(): Promise<void> {
    return await this.projectAggregate.migrateExperimentProtocols();
  }

  @CnUserCategories(BlUserCategory.ADMIN)
  @Post('project-document-migrate')
  async projectDocumentMigrate(): Promise<void> {
    return await this.projectAggregate.migrateProjectDocuments();
  }
}
