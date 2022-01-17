import {Body, Controller, Delete, Get, Param, Post, Put, Query, Res} from '@nestjs/common';
import {HnFolderService} from './hn-folder.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnNode, HnFolder} from './hn-folder.entity';
import {HnDocumentation, HnDocumentationResDTO} from '../documentation/hn-documentation.entity';

@Controller('folder')
export class HnFolderController {
  constructor(
    private readonly folderService: HnFolderService,

  ) {
  }

  // @Post()
  // create(@Body(new BlParsePipe(HnFolderResDTO)) createFolder: HnFolderResDTO): Promise<HnFolder> {
  //   return this.folderService.create(createFolder);
  // }

  @Post('doc')
  createDoc(@Body(new BlParsePipe(HnDocumentationResDTO)) createDocumentation: HnDocumentationResDTO): Promise<HnDocumentation> {
    return this.folderService.createDoc(createDocumentation);
  }

  @Put('doc')
  updateDoc(@Body(new BlParsePipe(HnDocumentationResDTO)) createDocumentation: HnDocumentationResDTO): Promise<HnDocumentation> {
    return this.folderService.updateDoc(createDocumentation);
  }

  @BlPublic()
  @Get()
  async findAll(): Promise<HnFolder[]> {
    return this.folderService.findAll();
  }

  @BlPublic()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<HnFolder> {
    return this.folderService.findOne(id);
  }

  @BlPublic()
  @Get('folders/:id')
  findFoldersByParentId(@Param('id') id: string): Promise<HnFolder[]> {
    return this.folderService.findFoldersByParentId(id);
  }

  @BlPublic()
  @Get('docs/:id')
  findDocsByParentId(@Param('id') id: string): Promise<HnDocumentation[]> {
    return this.folderService.findDocsByParentId(id);
  }

  // @Put()
  // update(@Body(new BlParsePipe(HnFolderResDTO)) updateFolder: HnFolderResDTO): Promise<DnFolder> {
  //   return this.folderService.update(updateFolder);
  // }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.folderService.remove(id);
  }
}
