import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnLabFrontVersionsSecurityLayer} from './cn-lab-front-versions-security.layer';
import {BlParsePipe} from '@monorepo/back-core-lib';
import {CnSaveLabFrontVersionDTO} from './cn-lab-front-version.dto';
import {CnLabFrontVersion} from './cn-lab-front-version.entity';
import {ClPageI} from '@monorepo/core-lib';

@Controller('lab-front-versions')
export class CnLabFrontVersionsController {

  constructor(private securityLayer: CnLabFrontVersionsSecurityLayer) {
  }

  @Post()
  create(@Body(new BlParsePipe(CnSaveLabFrontVersionDTO)) entity: CnSaveLabFrontVersionDTO): Promise<CnLabFrontVersion> {
    return this.securityLayer.save(entity);
  }

  @Put()
  update(@Body(new BlParsePipe(CnSaveLabFrontVersionDTO)) entity: CnSaveLabFrontVersionDTO): Promise<CnLabFrontVersion> {
    return this.securityLayer.save(entity);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.securityLayer.delete(id);
  }

  @Get('')
  public getAll(@Query('page', ParseIntPipe) page: number,
                @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnLabFrontVersion>> {
    return this.securityLayer.getAll(page, size);
  }
}
