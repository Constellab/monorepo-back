import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BlParsePipe, BlPublic } from '@monorepo/back-core-lib';
import { HnFolder } from './folder/hn-folder.entity';
import { HnDocumentation } from './documentation/hn-documentation.entity';
import { HnFolderDto, HnNode, HnNodeDTO } from './folder/hn-folder.dto';
import { HnIsAdminGuard } from '../core/guards/hn-is-admin.guard';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';
import { HnDocumentationDto } from './documentation/hn-documentation.dto';

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
  updateTree(@Body() updatedTree: HnNode[]): Promise<HnNode[]> {
    return this.brickAggregateService.updateTree(updatedTree);
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
