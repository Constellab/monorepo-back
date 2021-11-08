import {Body, Controller, Get, Param, Post, Put, Query} from '@nestjs/common';
import {DnFolderService} from './dn-folder.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {DnNode, DnFolder, DnFolderResDTO} from './dn-folder.entity';
import {DnDocumentation} from '../documentation/dn-documentation.entity';

@Controller('folder')
export class DnFolderController {
  constructor(private readonly folderService: DnFolderService) {
  }

  @Post()
  create(@Body(new BlParsePipe(DnFolderResDTO)) createFolder: DnFolderResDTO): Promise<DnFolder> {
    return this.folderService.create(createFolder);
  }

  @BlPublic()
  @Get()
  async findAll(): Promise<DnFolder[]> {
    return this.folderService.findAll();
  }

  @BlPublic()
  @Get('/tree')
  async findTree(): Promise<DnNode>{
    return this.folderService.findTree();
  }

  @BlPublic()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<DnFolder> {
    return this.folderService.findOne(id);
  }

  @BlPublic()
  @Get('folders/:id')
  findFoldersByParentId(@Param('id') id: string): Promise<DnFolder[]> {
    return this.folderService.findFoldersByParentId(id);
  }

  @BlPublic()
  @Get('docs/:id')
  findDocsByParentId(@Param('id') id: string): Promise<DnDocumentation[]> {
    return this.folderService.findDocsByParentId(id);
  }

  // @Put()
  // update(@Body(new BlParsePipe(DnFolder)) updateDocumentation: DnFolderEditDTO): Promise<DnDocumentation> {
  //   return this.folderService.update(updateDocumentation);
  // }
}
