import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query} from '@nestjs/common';
import {CnServerInfo} from './cn-server-info.entity';
import {CnServersInfoService} from './cn-servers-info.service';
import {BlParsePipe} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';

@Controller('servers-info')
export class CnServersInfoController {

  constructor(private serverInfoService: CnServersInfoService) {
  }

  @Post()
  create(@Body(new BlParsePipe(CnServerInfo)) serverInfo: CnServerInfo): Promise<CnServerInfo> {
    return this.serverInfoService.createSecure(serverInfo);
  }

  @Put()
  update(@Body(new BlParsePipe(CnServerInfo)) serverInfo: CnServerInfo): Promise<CnServerInfo> {
    return this.serverInfoService.updateSecure(serverInfo);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.serverInfoService.deleteSecure(id);
  }

  @Get()
  getAll(@Query('page', ParseIntPipe) page: number,
         @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnServerInfo>> {
    return this.serverInfoService.findAllSecure(page, size);
  }

}
