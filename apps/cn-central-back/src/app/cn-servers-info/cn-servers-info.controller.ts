import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnServerInfo} from './server-info/cn-server-info.entity';
import {BlParsePipe, BlSearchParams, BlUserCategory} from '@monorepo/back-core-lib';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CnServerInfoAggregateService} from './cn-server-info-aggregate.service';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';

@Controller('servers-info')
export class CnServersInfoController {

  constructor(private aggregateService: CnServerInfoAggregateService) {
  }

  @Post()
  create(@Body(new BlParsePipe(CnServerInfo)) serverInfo: CnServerInfo): Promise<CnServerInfo> {
    return this.aggregateService.create(serverInfo);
  }

  @Put()
  update(@Body(new BlParsePipe(CnServerInfo)) serverInfo: CnServerInfo): Promise<CnServerInfo> {
    return this.aggregateService.update(serverInfo);
  }

  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.delete(id);
  }

  @Get()
  getAll(@Query('page', ParseIntPipe) page: number,
         @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnServerInfo>> {
    return this.aggregateService.findAll(page, size);
  }

  @Post('search')
  search(@Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
         @Query('page', ParseIntPipe) page: number,
         @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnServerInfo>> {
    return this.aggregateService.search(searchParam, page, size);
  }

  @Get(':id/regions')
  findAvailableRegionsForServer(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnCloudProviderRegion[]> {
    return this.aggregateService.findAvailableRegionsForServer(id);
  }

  @Get('standard-name/:name')
  findServerInfoByStandardName(@Param('name') name: string): Promise<CnServerInfo[]> {
    return this.aggregateService.findServerInfoByStandardName(name);
  }

  ////////////////////////////// PRICE MANAGEMENT //////////////////////////////

  // TODO : to be implemented
  @Get('storage/price')
  getStoragePrice(): number {
    return 3.1415;
  }

  @Get(':id/price')
  getPrice(@Param('id', new ParseUUIDPipe()) id: string): Promise<number> {
    return this.aggregateService.getServerCurrentPrice(id);
  }

  @CnUserCategories(BlUserCategory.ADMIN)
  @Post('price/migration')
  createDefaultPrices(): Promise<void> {
    return this.aggregateService.createDefaultPrices();
  }

}
