import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import {DnBrickService} from './dn-brick.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {DnBrick, DnCreateBrickDTO} from './dn-brick.entity';
import {DnNode} from '../folder/dn-folder.entity';
import {DnBrickIdAndVersion} from '../brick-version/dn-brick-version.entity';

@Controller('brick')
export class DnBrickController {
  constructor(private readonly brickService: DnBrickService) {
  }

  @BlPublic()
  @Get()
  find(): Promise<DnBrick[]>{
    return this.brickService.find();
  }

  @BlPublic()
  @Get('name')
  findOneByName(@Query() query: any): Promise<DnBrick> {
    return this.brickService.findByName(query.name);
  }

  @BlPublic()
  @Get('docs')
  findDocsByBrickId(@Body(new BlParsePipe(DnBrickIdAndVersion)) brickIdAndVersion: DnBrickIdAndVersion): Promise<DnNode>{
    return this.brickService.findDocsByBrickId(brickIdAndVersion);
  }

  @Post()
  create(@Body(new BlParsePipe(DnCreateBrickDTO)) createBrick: DnCreateBrickDTO): Promise<DnBrick> {
    return this.brickService.create(createBrick);
  }
}
