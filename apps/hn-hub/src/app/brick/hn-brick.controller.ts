import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {HnBrickService} from './hn-brick.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnBrick, HnCreateBrickDTO} from './hn-brick.entity';
import {HnNode} from '../folder/hn-folder.entity';
import {HnBrickVersion, HnNewVersionDTO} from '../brick-version/hn-brick-version.entity';
import {HnDocumentation} from '../documentation/hn-documentation.entity';

@Controller('brick')
export class HnBrickController {
  constructor(private readonly brickService: HnBrickService) {
  }

  @BlPublic()
  @Get()
  find(): Promise<HnBrick[]> {
    return this.brickService.find();
  }

  @BlPublic()
  @Get('name/:name')
  findOneByName(@Param('name') name: string): Promise<HnBrick> {
    return this.brickService.findByName(name);
  }

  @BlPublic()
  @Get('docs/:brickId/:version')
  async findDocsByBrick(@Param('brickId') brickId: string, @Param('version') version: string): Promise<HnNode> {
    return this.brickService.findDocsByBrickAndVersion(await this.brickService.findById(brickId), version);
  }

  @BlPublic()
  @Get('root-folder/:brickId/:version')
  async findRootFolderId(@Param('brickId') brickId: string, @Param('version') version: string): Promise<{ id: string }> {
    const id: string = await this.brickService.findRootFolderId(await this.brickService.findById(brickId), version);
    return {id: id};
  }

  @BlPublic()
  @Post('doc/:brickId/:version')
  async findCurrentDoc(@Param('brickId') brickId: string,
                       @Param('version') version: string,
                       @Body() body: any): Promise<HnDocumentation> {
    return this.brickService.findCurrentDoc(await this.brickService.findById(brickId), body.path, version);
  }

  @Post()
  create(@Body(new BlParsePipe(HnCreateBrickDTO)) createBrick: HnCreateBrickDTO): Promise<HnBrick> {
    return this.brickService.create(createBrick);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.brickService.deleteBrickById(id);
  }

  @Post('new-version')
  createNewVersion(@Body(new BlParsePipe(HnNewVersionDTO)) newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO>{
    return this.brickService.createNewVersion(newVersion);
  }

  @BlPublic()
  @Get('latest/:brickId')
  public getLatestBrickVersion(@Param('brickId') brickId: string): Promise<HnBrickVersion> {
    return this.brickService.getLatestBrickVersion(brickId);
  }
}
