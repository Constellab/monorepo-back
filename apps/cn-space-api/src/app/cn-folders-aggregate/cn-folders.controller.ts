import {
  BlDtoHelper,
  BlFile,
  BlParseEnumPipe,
  BlParsePipe,
  BlResponseHelper,
  BlSearchParams,
  BlUploadedFile,
} from '@monorepo/back-core-lib';
import { ClPage, ClPageI } from '@monorepo/core-lib';
import { TeBlockFigureUploadedResponse, TeRichText, TeRichTextPipe } from '@monorepo/te-text-editor';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { CnActivity } from '../cn-activity/cn-activity.entity';
import { CnBucketLocationDTO } from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnFolderStorageUsageDTO } from './cn-documents/cn-document-dto.class';
import { CnFolderAggregateService } from './cn-folder-aggregate.service';
import { CnFolderUserConfigDTO, CnFolderUserDTO } from './cn-folder-user/cn-folder-user.dto';
import { CnRootFolderUserRole } from './cn-folder-user/cn-folder-user.entity';
import {
  CnFolderSimpleDTO,
  CnFolderStorageLocationDTO,
  CnGetFolderDescriptionDTO,
  CnSaveFolderDTO,
} from './cn-folders/cn-folder.dto';
import { CnFolder, CnFolderWithHierarchy } from './cn-folders/cn-folder.entity';
import { CnHierarchyObject } from './cn-hierarchy-objects/cn-hierarchy-object.entity';

@Controller('folders')
export class CnFoldersController {
  constructor(private folderAggregateService: CnFolderAggregateService) {}

  /**
   * return the list of root folder accessible by the user
   */
  @Get('/root/current')
  public getCurrentFolders(
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnHierarchyObject>> {
    return this.folderAggregateService.getCurrentRootFolders(page, size);
  }

  @Post('/root/search')
  searchRootFolders(
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    return this.folderAggregateService.searchRootFolders(searchParam, page, size);
  }

  @Get('/root/all')
  public async getAllCurrentFolders(): Promise<CnFolderSimpleDTO[]> {
    const folders = await this.folderAggregateService.getAllCurrentRootFolders();
    return folders.map((folder) => new CnFolderSimpleDTO(folder));
  }

  @Get('current-space')
  async getByCurrentSpace(
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnHierarchyObject>> {
    return await this.folderAggregateService.getByCurrentSpace(page, size);
  }

  @Post()
  create(@Body(new BlParsePipe(CnSaveFolderDTO)) folder: CnSaveFolderDTO): Promise<CnFolderWithHierarchy> {
    return this.folderAggregateService.createRootFolder(folder);
  }

  @Post(':id/sub-folder')
  createSubFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new BlParsePipe(CnSaveFolderDTO)) workPackage: CnSaveFolderDTO
  ): Promise<CnFolderWithHierarchy> {
    return this.folderAggregateService.createSubFolder(workPackage, id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new BlParsePipe(CnSaveFolderDTO)) folder: CnSaveFolderDTO
  ): Promise<CnFolderWithHierarchy> {
    return this.folderAggregateService.updateFolder(id, folder);
  }

  @Put(':id/name')
  renameFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name: string }
  ): Promise<CnFolderWithHierarchy> {
    return this.folderAggregateService.renameFolder(id, body.name);
  }

  @Post(':id/share/:groupOrUserId/role/:role')
  async shareFolder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('groupOrUserId', new ParseUUIDPipe()) groupOrUserId: string,
    @Param('role', new BlParseEnumPipe(CnRootFolderUserRole)) role: CnRootFolderUserRole
  ): Promise<CnFolderUserDTO[]> {
    const folderUsers = await this.folderAggregateService.shareFolder(id, groupOrUserId, role);
    return BlDtoHelper.listToDto(CnFolderUserDTO, folderUsers);
  }

  @Put(':id/share/:userId/role/:role')
  async updateShareFolder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('role', new BlParseEnumPipe(CnRootFolderUserRole)) role: CnRootFolderUserRole
  ): Promise<CnFolderUserDTO> {
    const folderUser = await this.folderAggregateService.updateFolderUserRole(id, userId, role);
    return new CnFolderUserDTO(folderUser);
  }

  @Delete(':id/unshare/:userId')
  unshareFolder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string
  ): Promise<void> {
    return this.folderAggregateService.unshareFolder(id, userId);
  }

  @Get(':id/children/folders')
  async getFolderTree(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnFolderSimpleDTO[]> {
    const result = await this.folderAggregateService.getChildrenFolders(id);
    return result.map((folder) => new CnFolderSimpleDTO(folder));
  }

  @Get(':id/users')
  getUsersOfFolder(@Param('id', ParseUUIDPipe) id: string): Promise<CnUser[]> {
    return this.folderAggregateService.getUsersOfFolder(id);
  }

  @Get(':id/users-role')
  async getFolderUsersWithRole(@Param('id', ParseUUIDPipe) id: string): Promise<CnFolderUserDTO[]> {
    const folderUsers = await this.folderAggregateService.getFolderUsersWithRole(id);
    return BlDtoHelper.listToDto(CnFolderUserDTO, folderUsers);
  }

  @Get(':id/users/search/name/:name?')
  searchFolderUsersByName(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('name') name: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnUser>> {
    return this.folderAggregateService.searchFolderUsersByName(id, name, page, size);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CnFolder> {
    return this.folderAggregateService.findFolder(id);
  }

  /////////////////////////////////// DESCRIPTION //////////////////////////////////////

  @Get(':id/description')
  getDescription(@Param('id', ParseUUIDPipe) id: string): Promise<CnGetFolderDescriptionDTO> {
    return this.folderAggregateService.getDescription(id);
  }

  @Put(':id/description')
  updateDescription(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(TeRichTextPipe) description: TeRichText
  ): Promise<void> {
    return this.folderAggregateService.updateDescription(id, description);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put(':folderId/description/image')
  saveDescriptionImage(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @BlUploadedFile() file: BlFile
  ): Promise<TeBlockFigureUploadedResponse> {
    return this.folderAggregateService.saveDescriptionImage(folderId, file);
  }

  /**
   * Return an image of the description
   * Use documentName(*) to catch all the documentName (including slashes)
   */
  @Get(':folderId/description/image/:documentName(*)')
  public async getDescriptionImage(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @Param('documentName') documentName: string,
    @Res() response: Response
  ): Promise<any> {
    const file = await this.folderAggregateService.getDescriptionImage(folderId, documentName);
    if (file) {
      BlResponseHelper.setFileResponseAndCache(response, file);
    } else {
      response.status(404).send('File not found');
    }
  }

  /////////////////////////////// Folder Bucket ///////////////////////////////////////////
  @Post(':folderId/storage')
  createFolderBucket(
    @Body() createFolderBucketDto: CnFolderStorageLocationDTO,
    @Param('folderId', new ParseUUIDPipe()) folderId: string
  ): Promise<CnFolderStorageLocationDTO> {
    return this.folderAggregateService.createFolderBucket(folderId, createFolderBucketDto);
  }

  @Get(':folderId/storage')
  getFolderStorage(
    @Param('folderId', new ParseUUIDPipe()) folderId: string
  ): Promise<CnFolderStorageLocationDTO> {
    return this.folderAggregateService.getFolderStorage(folderId);
  }

  @Get('storage/buckets')
  findAccessibleFolderBucketLocation(
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPage<CnBucketLocationDTO>> {
    return this.folderAggregateService.findAccessibleFolderBucketLocation(page, size);
  }

  @Get(':folderId/storage/size')
  getStorageSizeByFolders(
    @Param('folderId', new ParseUUIDPipe()) folderId: string
  ): Promise<CnFolderStorageUsageDTO> {
    return this.folderAggregateService.getStorageSizeByFolder(folderId);
  }

  /////////////////////////////// Folder user ///////////////////////////////////////////

  @Get(':folderId/user-config')
  async getFolderUserConfig(
    @Param('folderId', new ParseUUIDPipe()) folderId: string
  ): Promise<CnFolderUserConfigDTO> {
    const folderUser = await this.folderAggregateService.getCurrentUserFolderInfo(folderId);
    return new CnFolderUserConfigDTO(folderUser);
  }

  @Put(':folderId/user-config')
  async updateFolderUserConfig(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @Body(new BlParsePipe(CnFolderUserConfigDTO)) body: CnFolderUserConfigDTO
  ): Promise<CnFolderUserConfigDTO> {
    const folderUser = await this.folderAggregateService.updateRootFolderCurrentUserConfig(folderId, body);
    return new CnFolderUserConfigDTO(folderUser);
  }

  /////////////////////////////// Activity ///////////////////////////////////////////

  @Post(':folderId/activity')
  async searchActivity(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnActivity>> {
    return await this.folderAggregateService.searchFolderActivity(folderId, searchParam, page, size);
  }
}
