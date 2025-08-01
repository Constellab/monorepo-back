import { BlParsePipe, BlPublic } from '@monorepo/back-core-lib';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { HnIsAdminGuard } from '../core/guards/hn-is-admin.guard';
import { HnDocumentationDto } from './documentation/hn-documentation.dto';
import { HnDocumentation } from './documentation/hn-documentation.entity';
import { HnFolderDto, HnNode, HnNodeDTO, HnNodeType } from './folder/hn-folder.dto';
import { HnFolder } from './folder/hn-folder.entity';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';

@Controller('folder')
@UseGuards(HnIsAdminGuard)
export class HnFolderController {
  constructor(private readonly brickAggregateService: HnBrickAggregateService) {}

  @Post()
  create(@Body(new BlParsePipe(HnNodeDTO)) createFolder: HnNodeDTO): Promise<HnFolder> {
    return this.brickAggregateService.createFolder(createFolder);
  }

  @Post('doc')
  createDoc(@Body(new BlParsePipe(HnNodeDTO)) createDocumentation: HnNodeDTO): Promise<HnDocumentation> {
    return this.brickAggregateService.createDoc(createDocumentation);
  }

  @Put()
  update(@Body(new BlParsePipe(HnNodeDTO)) updatedFolder: HnNodeDTO): Promise<HnFolder> {
    return this.brickAggregateService.updateFolder(updatedFolder);
  }

  @Put('tree')
  updateNodeLocation(
    @Body('nodeId') nodeId: string,
    @Body('nodeType') nodeType: HnNodeType,
    @Body('oldOrder') oldOrder: number,
    @Body('newOrder') newOrder: number,
    @Body('oldParentId') oldParentId: string,
    @Body('newParentId') newParentId: string,
    @Body('mainFolderId') mainFolderId: string
  ): Promise<HnNode> {
    return this.brickAggregateService.updateNodeLocation(
      nodeId,
      nodeType,
      oldOrder,
      newOrder,
      oldParentId,
      newParentId,
      mainFolderId
    );
  }

  @BlPublic()
  @Get()
  findAll(): Promise<HnFolderDto[]> {
    return this.brickAggregateService.findAllFolders();
  }

  @BlPublic()
  @Get(':id')
  findById(@Param('id') id: string): Promise<HnFolderDto> {
    return this.brickAggregateService.findFolderById(id);
  }

  @BlPublic()
  @Get('folders/:id')
  findFoldersByParentId(@Param('id') id: string): Promise<HnFolderDto[]> {
    return this.brickAggregateService.findFoldersByParentId(id);
  }

  @BlPublic()
  @Get('docs/:id')
  findDocsByParentId(@Param('id') id: string): Promise<HnDocumentationDto[]> {
    return this.brickAggregateService.findDocsByParentId(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.brickAggregateService.removeFolder(id);
  }
}
