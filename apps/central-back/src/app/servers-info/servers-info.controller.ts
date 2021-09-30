import {Body, Controller, Get, Post, Put} from '@nestjs/common';
import {ServerInfo} from './server-info.entity';
import {ServersInfoService} from './servers-info.service';
import {UserCategories} from '../core/decorators/user-category.decorator';
import {CmUserCategory} from '@monorepo/common-model';
import {BlParsePipe} from '@monorepo/back-core-lib';

@Controller('servers-info')
export class ServersInfoController {

  constructor(private serverInfoService: ServersInfoService) {
  }

  @UserCategories(CmUserCategory.ADMIN)
  @Post()
  create(@Body(new BlParsePipe(ServerInfo)) serverInfo: ServerInfo): Promise<ServerInfo> {
    return this.serverInfoService.create(serverInfo);
  }

  @UserCategories(CmUserCategory.ADMIN)
  @Put()
  update(@Body(new BlParsePipe(ServerInfo)) serverInfo: ServerInfo): Promise<ServerInfo> {
    return this.serverInfoService.update(serverInfo);
  }

  @Get()
  getAll(): Promise<ServerInfo[]> {
    return this.serverInfoService.findAll();
  }

}
