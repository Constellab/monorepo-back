import {Body, Controller, Get, Post, Put} from '@nestjs/common';
import {UserCategory} from '../users/user-category.enum';
import {ParsePipe} from '../core/pipes/parse.pipe';
import {ServerInfo} from './server-info.entity';
import {ServersInfoService} from './servers-info.service';
import {UserCategories} from '../core/decorators/user-category.decorator';

@Controller('servers-info')
export class ServersInfoController {

  constructor(private serverInfoService: ServersInfoService) {
  }

  @UserCategories(UserCategory.ADMIN)
  @Post()
  create(@Body(new ParsePipe(ServerInfo)) serverInfo: ServerInfo): Promise<ServerInfo> {
    return this.serverInfoService.create(serverInfo);
  }

  @UserCategories(UserCategory.ADMIN)
  @Put()
  update(@Body(new ParsePipe(ServerInfo)) serverInfo: ServerInfo): Promise<ServerInfo> {
    return this.serverInfoService.update(serverInfo);
  }

  @Get()
  getAll(): Promise<ServerInfo[]> {
    return this.serverInfoService.findAll();
  }

}
