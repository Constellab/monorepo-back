import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { CnFolderAggregateService } from '../cn-folder-aggregate.service';
import { CnAvailableTags, CnTag } from '../cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';
import { CnHierarchyObjectTag } from '../cn-hierarchy-object-tags/cn-hierarchy-object-tag.entity';
import { ClPageI } from '@monorepo/core-lib';
import { CnHierarchyObject } from './cn-hierarchy-object.entity';

@Controller('hierarchy-objects')
export class CnHierarchyObjectController {
  constructor(private folderAggregateService: CnFolderAggregateService) {}

  ////////////////////////////////////////////// TAGS ///////////////////////////////////////////

  @Get('roots/tags/available')
  async getAvailableTagForRootFolders(): Promise<CnAvailableTags> {
    return this.folderAggregateService.getAvailableTagForRootFolders();
  }

  @Get(':hierarchyObjectId')
  async getHierarchyObject(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnHierarchyObject> {
    return this.folderAggregateService.getHierarchyObject(hierarchyObjectId);
  }

  @Post(':hierarchyObjectId/tags')
  async createTag(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Body() tag: CnTag
  ): Promise<CnHierarchyObjectTag> {
    return this.folderAggregateService.createHierarchyObjectTag(hierarchyObjectId, tag);
  }

  @Post(':hierarchyObjectId/tags/multiple')
  async createTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Body() tags: CnTag[]
  ): Promise<CnHierarchyObjectTag[]> {
    return this.folderAggregateService.createHierarchyObjectTags(hierarchyObjectId, tags);
  }

  @Post(':hierarchyObjectId/tags/delete')
  async deleteTag(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Body() tag: CnTag
  ): Promise<void> {
    return this.folderAggregateService.deleteHierarchyObjectTag(hierarchyObjectId, tag);
  }

  @Get(':hierarchyObjectId/tags')
  async getTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<CnTag>> {
    return this.folderAggregateService.getHierarchyObjectTagsPaginated(hierarchyObjectId, page, size);
  }

  @Get(':hierarchyObjectId/tags/all')
  async getAllTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnTag[]> {
    return this.folderAggregateService.getAllHierarchyObjectTags(hierarchyObjectId);
  }

  @Get(':hierarchyObjectId/tags/available-children')
  async getAvailableTagsInChildren(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnAvailableTags> {
    return this.folderAggregateService.getAvailableTagsInChildren(hierarchyObjectId);
  }

  @Get(':hierarchyObjectId/tags/available')
  async getAvailableTags(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnAvailableTags> {
    return this.folderAggregateService.getAvailableTags(hierarchyObjectId);
  }

  @Put(':hierarchyObjectId/archive')
  async archiveHierarchyObject(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnHierarchyObject> {
    return this.folderAggregateService.archiveHierarchyObject(hierarchyObjectId);
  }

  @Put(':hierarchyObjectId/unarchive')
  async unarchiveHierarchyObject(
    @Param('hierarchyObjectId', new ParseUUIDPipe()) hierarchyObjectId: string
  ): Promise<CnHierarchyObject> {
    return this.folderAggregateService.unarchiveHierarchyObject(hierarchyObjectId);
  }
}
