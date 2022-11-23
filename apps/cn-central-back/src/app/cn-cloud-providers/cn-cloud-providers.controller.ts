import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query} from '@nestjs/common';
import {CnCloudProvidersService} from './cn-cloud-providers.service';
import {CnCloudProvider} from './cn-cloud-provider.entity';
import {ClPage} from '@monorepo/core-lib';
import {BlParsePipe} from '@monorepo/back-core-lib';

@Controller('cloud-providers')
export class CnCloudProvidersController {

  constructor(private service: CnCloudProvidersService) {
  }

  @Post()
  public async create(@Body(new BlParsePipe(CnCloudProvider)) cloudProvider: CnCloudProvider): Promise<CnCloudProvider> {
    return this.service.createSecure(cloudProvider);
  }


  @Put()
  public async update(@Body(new BlParsePipe(CnCloudProvider)) cloudProvider: CnCloudProvider): Promise<CnCloudProvider> {
    return this.service.updateSecure(cloudProvider);
  }

  @Delete(':id')
  public async delete(@Param('id') id: string): Promise<void> {
    return this.service.deleteSecure(id);
  }

  @Get()
  public async findAll(@Query('page', ParseIntPipe) page: number,
                       @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnCloudProvider>> {
    return this.service.findAllSecure(page, size);
  }

}
