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
import { CnFolder, CnFolderWithHierarchy } from './cn-folders/cn-folder.entity';
import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlResponseHelper, BlRichTextBlockModificationDto,
  BlRichTextContent,
  BlRichTextUploadedImageResponse,
  BlRichTextUploadFileResponse,
  BlSearchParams,
  BlUploadedFile
} from '@monorepo/back-core-lib';
import { ClPage, ClPageI } from '@monorepo/core-lib';
import { CnFolderAggregateService } from './cn-folder-aggregate.service';
import { CnFolderStorageLocationDTO, CnGetFolderDescriptionDTO, CnSaveFolderDTO } from './cn-folders/cn-folder.dto';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnChatMessage } from '../cn-chat-message/cn-chat-message.entity';
import { CnMessage, CnNewMessageDTO } from '../cn-core/model/entities/cn-message.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CnFolderUser, CnFolderUserEntity } from './cn-folder-user/cn-folder-user.entity';
import { CnActivity } from '../cn-activity/cn-activity.entity';
import { CnBucketLocationDTO } from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnDocument } from './cn-documents/cn-document.entity';
import {
  CnConstellabDocumentDTO,
  CnDocumentPreviewDTO,
  CnFolderStorageUsageDTO
} from './cn-documents/cn-document-dto.class';
import { CnHierarchyObject, CnHierarchyObjectWithChildren } from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { HnStory } from '../../../../hn-hub/src/app/story/hn-story.entity';


@Controller('folders')
export class CnFoldersController {

  constructor(private folderAggregateService: CnFolderAggregateService) {
  }

  @Post()
  create(@Body(new BlParsePipe(CnSaveFolderDTO)) folder: CnSaveFolderDTO): Promise<CnFolderWithHierarchy> {
    return this.folderAggregateService.createRootFolder(folder);
  }

  @Post(':id/sub-folder')
  createSubFolder(@Param('id', ParseUUIDPipe) id: string,
                  @Body(new BlParsePipe(CnSaveFolderDTO)) workPackage: CnSaveFolderDTO): Promise<CnFolderWithHierarchy> {
    return this.folderAggregateService.createSubFolder(workPackage, id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string,
         @Body(new BlParsePipe(CnSaveFolderDTO)) folder: CnSaveFolderDTO): Promise<CnFolderWithHierarchy> {
    return this.folderAggregateService.updateFolder(id, folder);
  }

  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.folderAggregateService.deleteFolder(id);
  }

  /**
   * return the list of folder created by the current user with pagination
   */
  @Get('current')
  public getCurrentFolders(@Query('page', ParseIntPipe) page: number,
                           @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnHierarchyObject>> {
    return this.folderAggregateService.getCurrentRootFolders(page, size);
  }

  @Get('current-space')
  async getByCurrentSpace(@Query('page', ParseIntPipe) page: number,
                          @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnHierarchyObject>> {
    return await this.folderAggregateService.getByCurrentSpace(page, size);
  }

  @Post('current-space/search')
  async searchInCurrentSpace(@Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                             @Query('page', ParseIntPipe) page: number,
                             @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnFolder>> {
    return await this.folderAggregateService.searchInCurrentSpace(searchParam, page, size);
  }

  @Put(':id/share/:groupId')
  shareFolder(@Param('id', new ParseUUIDPipe()) id: string,
              @Param('groupId', new ParseUUIDPipe()) groupId: string): Promise<CnUser[]> {
    return this.folderAggregateService.shareFolder(id, groupId);
  }

  @Delete(':id/unshare/:userId')
  unshareFolder(@Param('id', new ParseUUIDPipe()) id: string,
                @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.folderAggregateService.unshareFolder(id, userId);
  }

  /**
   * Return a simplified folder tree for an object (folder, scenario, note)
   */
  @Get('tree/:id')
  async getFolderTree(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnHierarchyObject> {
    return await this.folderAggregateService.getFolderObjectTree(id);
  }

  @Post(':id/children/paginated')
  getChildrenPaginated(@Param('id', new ParseUUIDPipe()) id: string,
                       @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                       @Query('page', new ParseIntPipe()) page: number,
                       @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnHierarchyObject>> {
    return this.folderAggregateService.getChildrenPaginated(id, searchParam, page, size);
  }

  @Get(':id/ancestors')
  getFolderWithAncestors(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnHierarchyObject[]> {
    return this.folderAggregateService.getFolderAncestors(id);
  }

  @Get(':id/users')
  getUsersOfFolder(@Param('id', ParseUUIDPipe) id: string): Promise<CnUser[]> {
    return this.folderAggregateService.getUsersOfFolder(id);
  }

  @Get(':id/users/search/name/:name?')
  searchFolderUsersByName(@Param('id', ParseUUIDPipe) id: string,
                          @Param('name') name: string,
                          @Query('page', new ParseIntPipe()) page: number,
                          @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnUser>> {
    return this.folderAggregateService.searchFolderUsersByName(id, name, page, size);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CnFolder> {
    return this.folderAggregateService.findFolder(id);
  }

  @Put(':id/leader/:leaderId')
  updateLeader(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('leaderId', new ParseUUIDPipe()) leaderId: string): Promise<CnFolder> {
    return this.folderAggregateService.updateFolderLeader(id, leaderId);
  }

  /////////////////////////////////// FOLDER HIERARCHY //////////////////////////////////////


  /////////////////////////////////// DESCRIPTION //////////////////////////////////////

  @Get(':id/description')
  getDescription(@Param('id', ParseUUIDPipe) id: string): Promise<CnGetFolderDescriptionDTO> {
    return this.folderAggregateService.getDescription(id);
  }

  @Put(':id/description')
  updateDescription(@Param('id', new ParseUUIDPipe()) id: string,
                    @Body() description: BlRichTextContent): Promise<void> {
    return this.folderAggregateService.updateDescription(id, description);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put(':folderId/description/image')
  saveDescriptionImage(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                       @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadedImageResponse> {
    return this.folderAggregateService.saveDescriptionImage(folderId, file);
  }

  /**
   * Return an image of the description
   * Use documentName(*) to catch all the documentName (including slashes)
   */
  @Get(':folderId/description/image/:documentName(*)')
  public async getDescriptionImage(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                                   @Param('documentName') documentName: string,
                                   @Res() response: Response): Promise<any> {
    const file = await this.folderAggregateService.getDescriptionImage(folderId, documentName);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  /////////////////////////////// CHAT ///////////////////////////////////////////
  @Get('chat/folder-tree')
  getChatFolders(): Promise<CnHierarchyObjectWithChildren[]> {
    return this.folderAggregateService.getChatFolders();
  }

  /////////////////////////////// MESSAGES ///////////////////////////////////////////

  @Put(':folderId/chat/:enabled')
  activateChat(@Param('folderId', ParseUUIDPipe) folderId: string,
               @Param('enabled', ParseBoolPipe) enabled: boolean): Promise<CnFolder> {
    return this.folderAggregateService.activateChat(folderId, enabled);
  }


  @UseInterceptors(FileInterceptor('file'))
  @Put(':folderId/chat/message/image')
  saveMessageImage(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                   @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadedImageResponse> {
    return this.folderAggregateService.saveMessageImage(file, folderId);
  }

  /**
   * Return an image of a message
   * Use documentName(*) to catch all the documentName (including slashes)
   */
  @Get(':folderId/chat/message/image/:documentName(*)')
  public async getMessageImage(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                               @Param('documentName') documentName: string,
                               @Res() response: Response): Promise<any> {
    const file = await this.folderAggregateService.getMessageImage(documentName, folderId);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  @Post(':folderId/chat/message')
  createFolderMessage(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                      @Body(new BlParsePipe(CnNewMessageDTO)) newMessageDTO: CnNewMessageDTO): Promise<CnChatMessage> {
    return this.folderAggregateService.createChatMessage(newMessageDTO, folderId);
  }

  @Put(':folderId/chat/message/:messageId')
  updateFolderMessage(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                      @Param('messageId', new ParseUUIDPipe()) messageId: string,
                      @Body() body: any): Promise<CnMessage> {
    return this.folderAggregateService.updateChatMessage(folderId, messageId, body.content);
  }


  @Get(':folderId/chat/message')
  getFolderMessages(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                    @Query('page', new ParseIntPipe()) page: number,
                    @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnChatMessage>> {
    return this.folderAggregateService.getFolderMessages(folderId, page, size);
  }

  @Delete(':folderId/chat/message/:messageId/delete')
  deleteFolderMessage(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                      @Param('messageId', new ParseUUIDPipe()) messageId: string): Promise<void> {
    return this.folderAggregateService.deleteChatMessage(folderId, messageId);
  }

  /////////////////////////////// DOCUMENT ///////////////////////////////////////////
  @UseInterceptors(FileInterceptor('file'))
  @Post(':folderId/document')
  async uploadDocument(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                       @BlUploadedFile() file: BlFile): Promise<CnHierarchyObject> {
    return this.folderAggregateService.uploadDocument(folderId, file);
  }


  /**
   * Return a document
   */
  @Get('document/:documentId/preview/:filename(*)')
  public async previewDocument(@Param('documentId') documentId: string,
                               @Param('filename') _: string,
                               @Res() response: Response): Promise<any> {
    const file = await this.folderAggregateService.getUploadedDocument(documentId);
    BlResponseHelper.setFileResponse(response, file);
  }

  @Get('document/:documentId/download/:filename(*)')
  public async downloadDocument(@Param('documentId') documentId: string,
                                @Param('filename') _: string): Promise<StreamableFile> {
    const file = await this.folderAggregateService.getUploadedDocument(documentId);

    // use as any as this still works
    return BlResponseHelper.getFileResponse(file.file as any);
  }


  @Delete('document/:documentId')
  deleteDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<void> {
    return this.folderAggregateService.deleteDocument(documentId);
  }

  @Put('document/:documentId/move-to-trash')
  moveToTrash(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<CnDocument> {
    return this.folderAggregateService.moveDocumentToTrash(documentId);
  }

  @Put('document/:documentId/restore-from-trash')
  restoreDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<CnDocument> {
    return this.folderAggregateService.restoreDocumentFromTrash(documentId);
  }

  @Put(':folderId/empty-trash')
  emptyTrash(@Param('folderId', new ParseUUIDPipe()) folderId: string): Promise<void> {
    return this.folderAggregateService.emptyTrash(folderId);
  }

  @Get(':folderId/document/trashed')
  public getTrashedDocumentByFolder(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                                    @Query('page', ParseIntPipe) page: number,
                                    @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnDocument>> {
    return this.folderAggregateService.getDocumentsByFolder(folderId, true, page, size);
  }

  @Put('document/:documentId/rename')
  public renameDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                        @Body() name: { name: string }): Promise<CnDocument> {
    return this.folderAggregateService.renameDocument(documentId, name.name);
  }

  @Put('document/:documentId/move/:folderId')
  public moveDocumentToFolder(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                              @Param('folderId', new ParseUUIDPipe()) folderId: string): Promise<CnDocument> {
    return this.folderAggregateService.moveDocumentToFolder(documentId, folderId);
  }

  ////////////////////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////////////
  @Post(':folderId/constellab-document')
  public createConstellabDocument(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                                  @Body() name: { name: string }): Promise<CnConstellabDocumentDTO> {
    return this.folderAggregateService.createConstellabDocument(folderId, name.name);
  }

  @Put('constellab-document/:documentId')
  public updateConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                                  @Body() body: BlRichTextContent): Promise<CnConstellabDocumentDTO> {
    return this.folderAggregateService.updateConstellabDocument(documentId, body);
  }

  // check if the user can edit (is no other user is editing the document)
  @Get('constellab-document/:documentId/check-edit')
  public checkEditConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<void> {
    return this.folderAggregateService.checkEditConstellabDocument(documentId);
  }

  @Get('constellab-document/:documentId')
  public getConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<CnConstellabDocumentDTO> {
    return this.folderAggregateService.getConstellabDocument(documentId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('constellab-document/:documentId/image')
  async uploadImageToConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                                        @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadedImageResponse> {
    return this.folderAggregateService.uploadImageToConstellabDocument(documentId, file);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('constellab-document/:documentId/file')
  async uploadFileToConstellabDocument(@Param('documentId', new ParseUUIDPipe()) documentId: string,
                                       @BlUploadedFile() file: BlFile): Promise<BlRichTextUploadFileResponse> {
    return this.folderAggregateService.uploadFileToConstellabDocument(documentId, file);
  }

  @Get('constellab-document/:documentId/file/:documentName(*)')
  public async getConstellabDocumentImage(@Param('documentId') documentId: string,
                                          @Param('documentName') documentName: string,
                                          @Res() response: Response): Promise<any> {
    const file = await this.folderAggregateService.getConstellabDocumentContentDocument(documentId, documentName);
    BlResponseHelper.setFileResponse(response, file);
  }

  ////////////////////////////////////////////// DOCUMENT PREVIEW  /////////////////////////////////////////////

  @Post('document/:documentId/preview-token')
  public async generatePreviewToken(@Param('documentId', new ParseUUIDPipe()) documentId: string): Promise<CnDocumentPreviewDTO> {
    return this.folderAggregateService.generatePreviewToken(documentId);
  }

  @BlPublic()
  @Get('document/preview/:token')
  public async getDocumentPreview(@Param('token') token: string,
                                  @Res() response: Response): Promise<any> {
    const file = await this.folderAggregateService.getDocumentByPreviewToken(token);
    BlResponseHelper.setFileResponse(response, file);
  }


  /////////////////////////////// Folder Bucket ///////////////////////////////////////////
  @Post(':folderId/storage')
  createFolderBucket(@Body() createFolderBucketDto: CnFolderStorageLocationDTO,
                     @Param('folderId', new ParseUUIDPipe()) folderId: string): Promise<CnFolderStorageLocationDTO> {
    return this.folderAggregateService.createFolderBucket(folderId, createFolderBucketDto);
  }

  @Get(':folderId/storage')
  getFolderStorage(@Param('folderId', new ParseUUIDPipe()) folderId: string): Promise<CnFolderStorageLocationDTO> {
    return this.folderAggregateService.getFolderStorage(folderId);
  }

  @Get('storage/buckets')
  findAccessibleFolderBucketLocation(@Query('page', ParseIntPipe) page: number,
                                     @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnBucketLocationDTO>> {
    return this.folderAggregateService.findAccessibleFolderBucketLocation(page, size);
  }

  @Get(':folderId/storage/size')
  getStorageSizeByFolders(@Param('folderId', new ParseUUIDPipe()) folderId: string): Promise<CnFolderStorageUsageDTO> {
    return this.folderAggregateService.getStorageSizeByFolder(folderId);
  }

  /////////////////////////////// Folder user ///////////////////////////////////////////

  @Get(':folderId/user-config')
  getFolderUserConfig(@Param('folderId', new ParseUUIDPipe()) folderId: string): Promise<CnFolderUser> {
    return this.folderAggregateService.getCurrentUserRootFolderConfig(folderId);
  }

  @Put(':folderId/user-config')
  updateFolderUserConfig(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                         @Body() body: CnFolderUserEntity): Promise<CnFolderUser> {
    return this.folderAggregateService.updateRootFolderCurrentUserConfig(folderId, body);
  }

  /////////////////////////////// Activity ///////////////////////////////////////////

  @Post(':folderId/activity')
  async searchActivity(@Param('folderId', new ParseUUIDPipe()) folderId: string,
                       @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                       @Query('page', ParseIntPipe) page: number,
                       @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnActivity>> {
    return await this.folderAggregateService.searchFolderActivity(folderId, searchParam, page, size);
  }


  /////////////////////////////// History ///////////////////////////////////////////
  @Get('history/:documentId')
  async getStoryModifications(
    @Param('documentId', new ParseUUIDPipe()) documentId: string
  ): Promise<BlRichTextBlockModificationDto[]> {
    return this.folderAggregateService.getDocumentModifications(documentId);
  }

  @Get('history/undo-content/:documentId/:modificationId')
  async undoContent(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Param('modificationId', new ParseUUIDPipe()) modificationId: string
  ): Promise<Record<string, any>> {
    return this.folderAggregateService.getUndoContent(documentId, modificationId);
  }

  @Put('history/rollback/:documentId/:modificationId')
  async rollbackContent(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Param('modificationId', new ParseUUIDPipe()) modificationId: string
  ): Promise<CnDocument> {
    return this.folderAggregateService.rollbackContent(documentId, modificationId);
  }
}
