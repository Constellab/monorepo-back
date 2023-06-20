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
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnProjectStatus} from './cn-projects/cn-project-status.enum';
import {CnProjectStatusHistory} from './cn-projects/cn-project-status-history.entity';
import {BlFile, BlParseEnumPipe, BlParsePipe, BlResponseHelper, BlSearchParams} from '@monorepo/back-core-lib';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CnGroup} from '../cn-groups/cn-group.entity';
import {CnProjectAggregateService} from './cn-project-aggregate.service';
import {
  CnProjectAncestorTreeDTO,
  CnProjectAncestorType,
  CnProjectDtoHelper,
  CnProjectTreeDto,
  CnSaveProjectDTO
} from './cn-projects/cn-project.dto';
import {CnUser} from '../cn-users/cn-user.entity';
import {CmRichTextI, CmRichTextUploadedImage} from '@monorepo/common-model';
import {CnProjectComment} from '../cn-project-comment/cn-project-comment.entity';
import {CnComment, CnNewComment} from '../cn-core/model/entities/cn-comment.entity';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnBucket} from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import {CnDocument} from './cn-documents/cn-document.entity';
import {CnConstellabDocument} from './cn-documents/cn-document-dto.class';

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

  @Get('group/:groupId')
  public getByTeam(@Param('groupId', new ParseUUIDPipe()) groupId: string,
                   @Query('page', ParseIntPipe) page: number,
                   @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnProject>> {
    return this.projectAggregate.getProjectOfTeam(groupId, page, size);
  }

  @Put(':id/status/:status')
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('status', new BlParseEnumPipe(CnProjectStatus)) status: CnProjectStatus): Promise<CnProject> {
    return this.projectAggregate.updateProjectCurrentStatus(status, id);
  }

  /**
   * Get the list of group the project is shared with
   */
  @Get(':id/shared-groups')
  getProjectSharedGroups(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnGroup[]> {
    return this.projectAggregate.getProjectSharedGroups(id);
  }

  @Put(':id/share/:groupId')
  shareProject(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('groupId', new ParseUUIDPipe()) groupId: string): Promise<CnGroup> {
    return this.projectAggregate.shareProject(id, groupId);
  }

  @Delete(':id/unshare/:groupId')
  unshareProject(@Param('id', new ParseUUIDPipe()) id: string,
                 @Param('groupId', new ParseUUIDPipe()) groupId: string): Promise<void> {
    return this.projectAggregate.unshareProject(id, groupId);
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
                       @Param('id', new ParseUUIDPipe()) id: string): Promise<CnProjectTreeDto> {
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
  getDescription(@Param('id', ParseUUIDPipe) id: string): Promise<CmRichTextI> {
    return this.projectAggregate.getDescription(id);
  }

  @Put(':id/description')
  updateDescription(@Param('id', new ParseUUIDPipe()) id: string,
                    @Body() description: CmRichTextI): Promise<CnProject> {
    return this.projectAggregate.updateDescription(id, description);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put(':projectId/description/image')
  saveDescriptionImage(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                       @UploadedFile() file: BlFile): Promise<CmRichTextUploadedImage> {
    return this.projectAggregate.saveDescriptionImage(projectId, file);
  }

  /**
   * Return an image of a comment
   * Use filename(*) to catch all the filename (including slashes)
   */
  @Get(':projectId/description/image/:filename(*)')
  public async getDescriptionImage(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                                   @Param('filename') filename: string,
                                   @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getDescriptionImage(projectId, filename);
    BlResponseHelper.setMessageAndCache(response, file);
  }

  /////////////////////////////// COMMENTS ///////////////////////////////////////////

  @UseInterceptors(FileInterceptor('file'))
  @Put(':projectId/comment/image')
  saveCommentImage(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                   @UploadedFile() file: BlFile): Promise<CmRichTextUploadedImage> {
    return this.projectAggregate.saveCommentImage(file, projectId);
  }

  /**
   * Return an image of a comment
   * Use filename(*) to catch all the filename (including slashes)
   */
  @Get(':projectId/comment/image/:filename(*)')
  public async getCommentImage(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                               @Param('filename') filename: string,
                               @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getCommentImage(filename, projectId);
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
                       @UploadedFile() file: BlFile): Promise<CnDocument> {
    return this.projectAggregate.uploadDocument(projectId, file);
  }


  /**
   * Return a document
   */
  @Get(':projectId/document/preview/:filename(*)')
  public async previewDocument(@Param('projectId') projectId: string,
                               @Param('filename') filename: string,
                               @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getDocument(projectId, filename);
    BlResponseHelper.setMessage(response, file);
  }

  @Get(':projectId/document/download/:filename(*)')
  public async downloadDocument(@Param('projectId') projectId: string,
                                @Param('filename') filename: string): Promise<StreamableFile> {
    const file = await this.projectAggregate.getDocument(projectId, filename);
    return BlResponseHelper.getFileResponse(file);
  }


  @Delete('document/:documentId')
  deleteDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<void> {
    return this.projectAggregate.deleteDocument(documentId);
  }

  @Get(':projectId/document')
  public getDocumentsByProject(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                               @Query('page', ParseIntPipe) page: number,
                               @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnDocument>> {
    return this.projectAggregate.getDocumentsByProject(projectId, page, size);
  }

  @Put('document/:documentId/rename')
  public renameDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                        @Body() name: { name: string }): Promise<CnDocument> {
    return this.projectAggregate.renameDocument(documentId, name.name);
  }

  ////////////////////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////////////
  @Post(':projectId/constellab-document')
  public createConstellabDocument(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                                  @Body() name: { name: string }): Promise<CnConstellabDocument> {
    return this.projectAggregate.createConstellabDocument(projectId, name.name);
  }

  @Put('constellab-document/:documentId')
  public updateConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                                  @Body() body: CmRichTextI): Promise<CnConstellabDocument> {
    return this.projectAggregate.updateConstellabDocument(documentId, body);
  }

  @Get('constellab-document/:documentId')
  public getConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<CnConstellabDocument> {
    return this.projectAggregate.getConstellabDocument(documentId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('constellab-document/:documentId/image')
  async uploadImageToConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                                        @UploadedFile() file: BlFile): Promise<CmRichTextUploadedImage> {
    return this.projectAggregate.uploadImageToConstellabDocument(documentId, file);
  }

  @Get('constellab-document/:documentId/image/:filename(*)')
  public async getConstellabDocumentImage(@Param('documentId') documentId: string,
                                          @Param('filename') filename: string,
                                          @Res() response: Response): Promise<any> {
    const file = await this.projectAggregate.getConstellabDocumentImage(documentId, filename);
    BlResponseHelper.setMessage(response, file);
  }

  /////////////////////////////// Project Bucket ///////////////////////////////////////////
  @Post(':projectId/bucket')
  createProjectBucket(@Param('projectId', new ParseUUIDPipe()) projectId: string,
                      @Body() region: CnCloudProviderRegion): Promise<CnBucket> {
    return this.projectAggregate.createProjectBucket(projectId, region);
  }

  @Get(':projectId/bucket')
  getProjectBucket(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<CnBucket> {
    return this.projectAggregate.getProjectBucket(projectId);
  }


}
