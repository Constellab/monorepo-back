import { BlParsePipe, BlSearchParams } from '@monorepo/back-core-lib';
import { ClPage, ClPageI } from '@monorepo/core-lib';
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
} from '@nestjs/common';

import { CnAvailableTags, CnTag } from '../cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';
import { CnHierarchyObjectTag } from '../cn-hierarchy-object-tags/cn-hierarchy-object-tag.entity';
import {
  CnBulkActionContext,
  CnBulkCreateTagsDto,
  CnBulkMoveToFolderDto,
  CnHierarchyObjectFindOneDTO,
} from './cn-hierarchy-object.dto';
import { CnHierarchyObject, CnHierarchyObjectWithParent } from './cn-hierarchy-object.entity';
import { CnHierarchyObjectAggregateService } from './cn-hierarchy-object-aggregate.service';

@Controller('hierarchy-objects')
export class CnHierarchyObjectController {
  constructor(private hierarchyObjectAggregateService: CnHierarchyObjectAggregateService) {}

  //////////////////// GET /////////////////////////

  @Get(':hierarchyObjectId')
  async getHierarchyObject(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnHierarchyObjectFindOneDTO> {
    return this.hierarchyObjectAggregateService.getHierarchyObject(hierarchyObjectId);
  }

  @Get(':id/ancestors')
  getObjectAncestors(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnHierarchyObject[]> {
    return this.hierarchyObjectAggregateService.getObjectAncestors(id);
  }

  @Post(':id/children/paginated')
  getChildrenPaginated(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    return this.hierarchyObjectAggregateService.searchVisibleInFolderChildren(id, searchParam, page, size);
  }

  @Post(':id/trash/children/paginated')
  getTrashChildrenPaginated(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnHierarchyObject>> {
    return this.hierarchyObjectAggregateService.searchTrashInFolderChildren(id, searchParam, page, size);
  }

  @Post('/root/search-children')
  public async searchInRootFoldersAndChildren(
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnHierarchyObjectWithParent>> {
    return await this.hierarchyObjectAggregateService.searchVisibleInRootFoldersAndChildren(
      searchParam,
      page,
      size
    );
  }

  @Post('/root/trash/search-children')
  public async searchTrashInRootFoldersAndChildren(
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnHierarchyObjectWithParent>> {
    return await this.hierarchyObjectAggregateService.searchTrashInRootFoldersAndChildren(
      searchParam,
      page,
      size
    );
  }

  @Post('/root/search-applications')
  public async searchApplicationsInRootFolders(
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnHierarchyObject>> {
    return await this.hierarchyObjectAggregateService.searchApplicationsForCurrentUser(
      searchParam,
      page,
      size
    );
  }

  @Post('current-space/search')
  async searchInCurrentSpace(
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnHierarchyObject>> {
    return await this.hierarchyObjectAggregateService.searchInCurrentSpace(searchParam, page, size);
  }

  ////////////////////// BULK ////////////////////

  @Put('bulk/move-to-trash')
  async bulkMoveToTrash(@Body() context: CnBulkActionContext): Promise<void> {
    await this.hierarchyObjectAggregateService.bulkMoveToTrash(context);
  }

  @Put('bulk/move-to-folder')
  async bulkMoveToFolder(@Body() dto: CnBulkMoveToFolderDto): Promise<void> {
    await this.hierarchyObjectAggregateService.bulkMoveToFolder(dto);
  }

  @Post('bulk/tags/multiple')
  async bulkCreateTags(@Body() dto: CnBulkCreateTagsDto): Promise<void> {
    await this.hierarchyObjectAggregateService.bulkCreateTags(dto);
  }

  ////////////////////// UPDATE ////////////////////

  @Put(':hierarchyObjectId/move-to-trash')
  async moveToTrash(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnHierarchyObject> {
    return this.hierarchyObjectAggregateService.moveToTrash(hierarchyObjectId);
  }

  @Put(':hierarchyObjectId/restore-from-trash')
  async restoreFromTrash(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnHierarchyObject> {
    return this.hierarchyObjectAggregateService.restoreFromTrash(hierarchyObjectId);
  }

  @Put(':hierarchyObjectId/move-to-folder/:targetFolderId')
  async moveToFolder(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Param('targetFolderId', new ParseUUIDPipe()) targetFolderId: string
  ): Promise<CnHierarchyObject> {
    return this.hierarchyObjectAggregateService.moveHierarchyObjectToFolder(
      hierarchyObjectId,
      targetFolderId
    );
  }

  @Delete(':hierarchyObjectId')
  async deleteHierarchyObject(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<void> {
    return this.hierarchyObjectAggregateService.deleteHierarchyObjectById(hierarchyObjectId);
  }

  @Put(':folderId/empty-trash')
  emptyTrash(@Param('folderId', new ParseUUIDPipe()) folderId: string): Promise<void> {
    return this.hierarchyObjectAggregateService.emptyTrash(folderId);
  }

  ////////////////////////////////////////////// TAGS ///////////////////////////////////////////

  @Get('roots/tags/available')
  async getAvailableTagForRootFolders(): Promise<CnAvailableTags> {
    return this.hierarchyObjectAggregateService.getAvailableTagForRootFolders();
  }

  @Post(':hierarchyObjectId/tags')
  async createTag(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Body() tag: CnTag
  ): Promise<CnHierarchyObjectTag> {
    return this.hierarchyObjectAggregateService.createHierarchyObjectTag(hierarchyObjectId, tag);
  }

  @Post(':hierarchyObjectId/tags/multiple')
  async createTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Body() tags: CnTag[]
  ): Promise<CnHierarchyObjectTag[]> {
    return this.hierarchyObjectAggregateService.createHierarchyObjectTags(hierarchyObjectId, tags);
  }

  @Post(':hierarchyObjectId/tags/delete')
  async deleteTag(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Body() tag: CnTag
  ): Promise<void> {
    return this.hierarchyObjectAggregateService.deleteHierarchyObjectTag(hierarchyObjectId, tag);
  }

  @Get(':hierarchyObjectId/tags')
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

  @Get(':hierarchyObjectId/tags/all')
  async getAllTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnTag[]> {
    return this.hierarchyObjectAggregateService.getAllHierarchyObjectTags(hierarchyObjectId);
  }

  @Get(':hierarchyObjectId/tags/available-children')
  async getAvailableTagsInChildren(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnAvailableTags> {
    return this.hierarchyObjectAggregateService.getAvailableTagsInChildren(hierarchyObjectId);
  }

  @Get(':hierarchyObjectId/tags/available')
  async getAvailableTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnAvailableTags> {
    return this.hierarchyObjectAggregateService.getAvailableTags(hierarchyObjectId);
  }
}
