import { BlOptionalAuth, BlParsePipe } from '@monorepo/back-core-lib';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { HnIsAdminGuard } from '../core/guards/hn-is-admin.guard';
import { HnDocumentationDto } from './documentation/hn-documentation.dto';
import { HnDocumentation } from './documentation/hn-documentation.entity';
import { HnFolderDto, HnNode, HnNodeDTO } from './folder/hn-folder.dto';
import { HnFolder } from './folder/hn-folder.entity';
import { HnBrickAggregateService, HnNodeLocationUpdate } from './hn-brick-aggregate.service';

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
  updateNodeLocation(@Body() nodeLocation: HnNodeLocationUpdate): Promise<HnNode> {
    return this.brickAggregateService.updateNodeLocation(nodeLocation);
  }

  @BlOptionalAuth()
  @Get()
  findAll(): Promise<HnFolderDto[]> {
    return this.brickAggregateService.findAllFolders();
  }

  @BlOptionalAuth()
  @Get(':id')
  findById(@Param('id') id: string): Promise<HnFolderDto> {
    return this.brickAggregateService.findFolderById(id);
  }

  @BlOptionalAuth()
  @Get('folders/:id')
  findFoldersByParentId(@Param('id') id: string): Promise<HnFolderDto[]> {
    return this.brickAggregateService.findFoldersByParentId(id);
  }

  @BlOptionalAuth()
  @Get('docs/:id')
  findDocsByParentId(@Param('id') id: string): Promise<HnDocumentationDto[]> {
    return this.brickAggregateService.findDocsByParentId(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.brickAggregateService.removeFolder(id);
  }
}
