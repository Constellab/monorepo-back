import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {HnFolderService} from './hn-folder.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnFolder} from './hn-folder.entity';
import {HnDocumentation} from '../documentation/hn-documentation.entity';
import {HnNode, HnNodeDTO} from './hn-folder.dto';
import {HnIsAdminGuard} from '../core/guards/hn-is-admin.guard';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';

@Controller('folder')
@UseGuards(HnIsAdminGuard)
export class HnFolderController {
  constructor(
    private readonly folderService: HnFolderService,
  ) {
  }

  @IsAdmin()
  @Post()
  create(@Body(new BlParsePipe(HnNodeDTO)) createFolder: HnNodeDTO): Promise<HnFolder> {
    return this.folderService.create(createFolder);
  }

  @IsAdmin()
  @Post('doc')
  createDoc(@Body(new BlParsePipe(HnNodeDTO)) createDocumentation: HnNodeDTO): Promise<HnDocumentation> {
    return this.folderService.createDoc(createDocumentation);
  }

  @IsAdmin()
  @Put()
  update(@Body(new BlParsePipe(HnNodeDTO)) updatedFolder: HnNodeDTO): Promise<HnFolder> {
    return this.folderService.update(updatedFolder);
  }

  @IsAdmin()
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

  @IsAdmin()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.folderService.remove(id);
  }
}
