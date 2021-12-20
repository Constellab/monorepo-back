import {Body, Controller, Get, Post, Put} from '@nestjs/common';
import {CnServerInfo} from './cn-server-info.entity';
import {CnServersInfoService} from './cn-servers-info.service';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {CmUserCategory} from '@monorepo/common-model';
import {BlParsePipe} from '@monorepo/back-core-lib';

@Controller('servers-info')
export class CnServersInfoController {

  constructor(private serverInfoService: CnServersInfoService) {
  }

  @CnUserCategories(CmUserCategory.ADMIN)
  @Post()
  create(@Body(new BlParsePipe(CnServerInfo)) serverInfo: CnServerInfo): Promise<CnServerInfo> {
    return this.serverInfoService.create(serverInfo);
  }

  @CnUserCategories(CmUserCategory.ADMIN)
  @Put()
  update(@Body(new BlParsePipe(CnServerInfo)) serverInfo: CnServerInfo): Promise<CnServerInfo> {
    return this.serverInfoService.update(serverInfo);
  }

  @Get()
  getAll(): Promise<CnServerInfo[]> {
    return this.serverInfoService.findAll();
  }

}
