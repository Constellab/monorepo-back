import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {HnFolderService} from './hn-folder.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnFolder, HnNode, HnNodeDTO} from './hn-folder.entity';
import {HnDocumentation} from '../documentation/hn-documentation.entity';

@Controller('folder')
export class HnFolderController {
  constructor(
    private readonly folderService: HnFolderService,
  ) {
  }

  @Post()
  create(@Body(new BlParsePipe(HnNodeDTO)) createFolder: HnNodeDTO): Promise<HnFolder> {
    return this.folderService.create(createFolder);
  }

  @Post('doc')
  createDoc(@Body(new BlParsePipe(HnNodeDTO)) createDocumentation: HnNodeDTO): Promise<HnDocumentation> {
    return this.folderService.createDoc(createDocumentation);
  }

  @Put()
  update(@Body(new BlParsePipe(HnNodeDTO)) updatedFolder: HnNodeDTO): Promise<HnFolder> {
    return this.folderService.update(updatedFolder);
  }

  @Put('tree')
  updateTree(@Body() updatedTree: HnNode[]): Promise<HnNode[]>{
    return this.folderService.updateTree(updatedTree);
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
