import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { CnCloudProvider, CnCloudProviderName } from './cn-cloud-provider.entity';
import { ClPage } from '@monorepo/core-lib';
import { BlParseEnumPipe, BlParsePipe } from '@monorepo/back-core-lib';
import { CnCloudProviderAggregateService } from './cn-cloud-provider-aggregate.service';
import {
  CnCloudProviderRegion,
  CnCloudProviderRegionType
} from './cn-cloud-provider-regions/cn-cloud-provider-region.entity';

@Controller('cloud-providers')
export class CnCloudProvidersController {

  constructor(private service: CnCloudProviderAggregateService) {
  }

  ///////////////////////////////// CLOUD PROVIDER /////////////////////////////////
  @Post()
  public async create(@Body(new BlParsePipe(CnCloudProvider)) cloudProvider: CnCloudProvider): Promise<CnCloudProvider> {
    return this.service.createCloudProvider(cloudProvider);
  }

  @Put()
  public async update(@Body(new BlParsePipe(CnCloudProvider)) cloudProvider: CnCloudProvider): Promise<CnCloudProvider> {
    return this.service.updateCloudProvider(cloudProvider);
  }

  @Delete(':id')
  public async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.deleteCloudProvider(id);
  }

  @Get()
  public async findAll(@Query('page', ParseIntPipe) page: number,
                       @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnCloudProvider>> {
    return this.service.findAllCloudProviders(page, size);
  }

  ////////////////////////////// REGION //////////////////////////////

  @Post('regions')
  public async createRegion(
    @Body(new BlParsePipe(CnCloudProviderRegion)) region: CnCloudProviderRegion): Promise<CnCloudProviderRegion> {
    return this.service.createRegion(region);
  }

  @Put('regions')
  public async updateRegion(
    @Body(new BlParsePipe(CnCloudProviderRegion)) region: CnCloudProviderRegion): Promise<CnCloudProviderRegion> {
    return this.service.updateRegion(region);
  }

  @Delete('regions/:id')
  public async deleteRegion(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.service.deleteRegion(id);
  }

  @Get('regions')
  public async getAllRegions(@Query('page', ParseIntPipe) page: number,
                             @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnCloudProviderRegion>> {
    return this.service.getAllRegions(page, size);
  }

  @Get('regions/type/:type')
  public async getAllS3Regions(@Param('type', new BlParseEnumPipe(CnCloudProviderRegionType)) type: CnCloudProviderRegionType,
                               @Query('page', ParseIntPipe) page: number,
                               @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnCloudProviderRegion>> {
    return this.service.findRegionByType(type, page, size);
  }

  @Get('regions/cloud-provider/:cloudProviderName')
  public async getRegionsByCloudProvider(@Param('cloudProviderName') cloudProviderName: CnCloudProviderName,
                                         @Query('page', ParseIntPipe) page: number,
                                         @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnCloudProviderRegion>> {
    return this.service.findRegionsByCloudProvider(cloudProviderName, page, size);
  }


}
