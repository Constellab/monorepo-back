import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnServerCloud} from './server-cloud/cn-server-cloud.entity';
import {BlParsePipe, BlSearchParams, BlUserCategory} from '@monorepo/back-core-lib';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CnServerAggregateService} from './cn-server-aggregate.service';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnServerStandard} from './server-standard/cn-server-standard.entity';
import {CnServerStandardSaveDTO} from './server-standard/cn-server-standard.dto';
import {CnServerPrice} from './server-price/cn-server-price.entity';
import {CnCreateServerPriceDTO} from './server-price/cn-server-price.dto';
import {CnStoragePrice} from './storage-price/cn-storage-price.entity';
import {CnCreateStoragePriceDTO} from './storage-price/cn-storage-price.dto';

@Controller('servers')
export class CnServerController {

  constructor(private aggregateService: CnServerAggregateService) {
  }

  //////////////////////////////////// SERVER STANDARD ////////////////////////////////////

  @Post('standard')
  createServerStandard(@Body(new BlParsePipe(CnServerStandardSaveDTO)) saveDTO: CnServerStandardSaveDTO): Promise<CnServerStandard> {
    return this.aggregateService.createServerStandard(saveDTO);
  }

  @Put('standard')
  updateServerStandard(@Body(new BlParsePipe(CnServerStandardSaveDTO)) saveDTO: CnServerStandardSaveDTO): Promise<CnServerStandard> {
    return this.aggregateService.updateServerStandard(saveDTO);
  }

  @Delete('standard/:id')
  deleteServerStandard(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.deleteServerStandard(id);
  }

  @Get('standard')
  getAllServerStandard(@Query('page', ParseIntPipe) page: number,
                       @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnServerStandard>> {
    return this.aggregateService.findAllServerStandard(page, size);
  }

  @Post('standard/names')
  findServerStandardByNames(@Body() names: string[]): Promise<CnServerStandard[]> {
    return this.aggregateService.findServerStandardByNames(names);
  }

  @Get('standard/:id/clouds')
  findByServerStandardId(@Param('id', new ParseUUIDPipe()) serverStandardId: string): Promise<CnServerCloud[]> {
    return this.aggregateService.findServerCloudByServerStandardId(serverStandardId);
  }


  //////////////////////////////////// SERVER CLOUD ////////////////////////////////////


  @Post('cloud')
  createServerCloud(@Body(new BlParsePipe(CnServerCloud)) serverCloud: CnServerCloud): Promise<CnServerCloud> {
    return this.aggregateService.createServerCloud(serverCloud);
  }

  @Put('cloud')
  updateServerCloud(@Body(new BlParsePipe(CnServerCloud)) serverCloud: CnServerCloud): Promise<CnServerCloud> {
    return this.aggregateService.updateServerCloud(serverCloud);
  }

  @Delete('cloud/:id')
  deleteServerCloud(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.deleteServerCloud(id);
  }

  @Get('cloud')
  getAllServerCloud(@Query('page', ParseIntPipe) page: number,
                    @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnServerCloud>> {
    return this.aggregateService.findAllServerCloud(page, size);
  }

  @Post('cloud/search')
  searchServerCloud(@Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                    @Query('page', ParseIntPipe) page: number,
                    @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnServerCloud>> {
    return this.aggregateService.searchServerCloud(searchParam, page, size);
  }

  @Get('cloud/:id/regions')
  findAvailableRegionsForServerCloud(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnCloudProviderRegion[]> {
    return this.aggregateService.findAvailableRegionsForServerCloud(id);
  }

  ////////////////////////////// SERVER PRICE //////////////////////////////


  @Get('standard/:id/current-price')
  getServerCurrentPrice(@Param('id', new ParseUUIDPipe()) id: string): Promise<number> {
    return this.aggregateService.getServerCurrentPrice(id);
  }

  @Get('standard/:id/all-prices')
  getServerAllPrices(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnServerPrice[]> {
    return this.aggregateService.getServerAllPrices(id);
  }

  @Post('standard/:id/price')
  createServerPrice(@Param('id', new ParseUUIDPipe()) id: string,
                    @Body(new BlParsePipe(CnCreateServerPriceDTO)) price: CnCreateServerPriceDTO): Promise<CnServerPrice> {
    return this.aggregateService.createServerPrice(id, price);
  }

  @Delete('standard/:id/price/:priceId')
  deleteServerPrice(@Param('id', new ParseUUIDPipe()) id: string,
                    @Param('priceId', new ParseUUIDPipe()) priceId: string): Promise<void> {
    return this.aggregateService.deleteServerPrice(id, priceId);
  }

  /////////////////////////////// STORAGE PRICE ///////////////////////////////

  @Get('storage/price/current')
  getStorageCurrentPrice(): Promise<number> {
    return this.aggregateService.getStorageCurrentPrice();
  }

  @Get('storage/price/all')
  getStorageAllPrices(): Promise<CnStoragePrice[]> {
    return this.aggregateService.getAllStoragePrices();
  }

  @Post('storage/price')
  createStoragePrice(@Body(new BlParsePipe(CnCreateStoragePriceDTO)) price: CnCreateStoragePriceDTO): Promise<CnStoragePrice> {
    return this.aggregateService.createStoragePrice(price);
  }

  @Delete('storage/price/:id')
  deleteStoragePrice(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.aggregateService.deleteStoragePrice(id);
  }

  @CnUserCategories(BlUserCategory.ADMIN)
  @Post('price/migration')
  createDefaultPrices(): Promise<void> {
    return this.aggregateService.createDefaultPrices();
  }

}
