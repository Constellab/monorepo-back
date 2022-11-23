import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnObjectStoragesAggregateService} from './cn-object-storages-aggregate.service';
import {CnBucket} from './cn-buckets/cn-bucket.entity';
import {ClPage} from '@monorepo/core-lib';
import {CnBucketRegion} from './cn-bucket-regions/cn-bucker-region.entity';
import {CnBucketCredentials} from './cn-bucket-credential/cn-bucket-credential.entity';
import {CnBucketCredentialsFull} from './cn-object-storage.dto';
import {BlDtoHelper, BlParsePipe} from '@monorepo/back-core-lib';


@Controller('object-storages')
export class CnObjectStoragesController {

  constructor(private service: CnObjectStoragesAggregateService) {
  }

  ////////////////////////////// BUCKETS //////////////////////////////
  @Post('buckets')
  public async createBucket(@Body(new BlParsePipe(CnBucket)) bucket: CnBucket): Promise<CnBucket> {
    return this.service.createBucket(bucket);
  }

  @Put('buckets')
  public async updateBucket(@Body(new BlParsePipe(CnBucket)) bucket: CnBucket): Promise<CnBucket> {
    return this.service.updateBucket(bucket);
  }

  @Delete('buckets/:id')
  public async deleteBucket(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.service.deleteBucket(id);
  }


  @Get('buckets')
  public async getBuckets(@Query('page', ParseIntPipe) page: number,
                          @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnBucket>> {
    return this.service.getBuckets(page, size);
  }

  ////////////////////////////// REGION //////////////////////////////

  @Post('regions')
  public async createBucketRegion(@Body(new BlParsePipe(CnBucketRegion)) region: CnBucketRegion): Promise<CnBucketRegion> {
    return this.service.createBucketRegion(region);
  }

  @Put('regions')
  public async updateBucketRegion(@Body(new BlParsePipe(CnBucketRegion)) region: CnBucketRegion): Promise<CnBucketRegion> {
    return this.service.updateBucketRegion(region);
  }

  @Delete('regions/:id')
  public async deleteBucketRegion(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.service.deleteBucketRegion(id);
  }


  @Get('regions')
  public async getBucketRegions(@Query('page', ParseIntPipe) page: number,
                                @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnBucketRegion>> {
    return this.service.getBucketRegions(page, size);
  }

  ////////////////////////////// CREDENTIALS //////////////////////////////

  @Post('credentials')
  public async createBucketCredentials(@Body(new BlParsePipe(CnBucketCredentials)) credentials: CnBucketCredentials)
    : Promise<CnBucketCredentialsFull> {
    const result = await this.service.createBucketCredentials(credentials);
    return BlDtoHelper.toDto(CnBucketCredentialsFull, result);
  }

  @Put('credentials')
  public async updateBucketCredentials(@Body(new BlParsePipe(CnBucketCredentials)) credentials: CnBucketCredentials)
    : Promise<CnBucketCredentialsFull> {
    const result = await this.service.updateBucketCredentials(credentials);
    return BlDtoHelper.toDto(CnBucketCredentialsFull, result);
  }

  @Delete('credentials/:id')
  public async deleteBucketCredentials(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.service.deleteBucketCredentials(id);
  }

  @Get('credentials')
  public async getBucketCredentialsList(@Query('page', ParseIntPipe) page: number,
                                        @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnBucketCredentialsFull>> {
    const credentials = await this.service.getAllBucketCredentials(page, size);
    return BlDtoHelper.pageToDto(CnBucketCredentialsFull, credentials);
  }

}
