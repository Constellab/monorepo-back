import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import {HnBrickService} from './hn-brick.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnBrick, HnCreateBrickDTO} from './hn-brick.entity';
import {HnNode} from '../folder/hn-folder.entity';
import {HnBrickIdAndVersion, HnBrickPathVersion} from '../brick-version/hn-brick-version.entity';
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
  @Post('docs')
  async findDocsByBrick(@Body(new BlParsePipe(HnBrickIdAndVersion)) brickIdAndVersion: HnBrickIdAndVersion): Promise<HnNode> {
    if(!brickIdAndVersion.version){
      // TODO fuction to get the latest version
    }
    brickIdAndVersion.version = 1; // A modif
    return this.brickService.findDocsByBrickAndVersion(await this.brickService.findById(brickIdAndVersion.id), brickIdAndVersion.version);
  }

  @BlPublic()
  @Post('root-folder')
  async findRootFolderId(@Body(new BlParsePipe(HnBrickIdAndVersion)) brickIdAndVersion: HnBrickIdAndVersion): Promise<{id: string}> {
    const id: string = await this.brickService.findRootFolderId(await this.brickService.findById(brickIdAndVersion.id), brickIdAndVersion.version);
    return {id: id};
  }

  @BlPublic()
  @Post('doc')
  async findCurrentDoc(@Body(new BlParsePipe(HnBrickPathVersion)) brickPathVersion: HnBrickPathVersion): Promise<HnDocumentation> {
    return this.brickService.findCurrentDoc(await this.brickService.findById(brickPathVersion.id), brickPathVersion.path, brickPathVersion.version);
  }

  @Post()
  create(@Body(new BlParsePipe(HnCreateBrickDTO)) createBrick: HnCreateBrickDTO): Promise<HnBrick> {
    return this.brickService.create(createBrick);
  }
}
