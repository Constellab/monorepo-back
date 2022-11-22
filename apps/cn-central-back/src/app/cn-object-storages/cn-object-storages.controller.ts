import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnObjectStoragesAggregateService} from './cn-object-storages-aggregate.service';
import {CnBucket} from './cn-buckets/cn-bucket.entity';
import {ClPage} from '@monorepo/core-lib';
import {CnBucketRegion} from './cn-bucket-regions/cn-bucker-region.entity';
import {CnBucketCredentials} from './cn-bucket-credential/cn-bucket-credential.entity';


@Controller('object-storages')
export class CnObjectStoragesController {

  constructor(private service: CnObjectStoragesAggregateService) {
  }

  ////////////////////////////// BUCKETS //////////////////////////////
  @Post('buckets')
  public async createBucket(@Body() bucket: CnBucket): Promise<CnBucket> {
    return this.service.createBucket(bucket);
  }

  @Put('buckets')
  public async updateBucket(@Body() bucket: CnBucket): Promise<CnBucket> {
    return this.service.updateBucket(bucket);
  }

  @Delete('buckets/:id')
  public async deleteBucket(@Param(ParseUUIDPipe) id: string): Promise<void> {
    return this.service.deleteBucket(id);
  }

  @Get('buckets/:id')
  public async getBucket(@Param(ParseUUIDPipe) id: string): Promise<CnBucket> {
    return this.service.getBucket(id);
  }

  @Get('buckets')
  public async getBuckets(@Query('page', ParseIntPipe) page: number,
                          @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnBucket>> {
    return this.service.getBuckets(page, size);
  }

  ////////////////////////////// REGION //////////////////////////////

  @Post('regions')
  public async createBucketRegion(@Body() region: CnBucketRegion): Promise<CnBucketRegion> {
    return this.service.createBucketRegion(region);
  }

  @Put('regions')
  public async updateBucketRegion(@Body() region: CnBucketRegion): Promise<CnBucketRegion> {
    return this.service.updateBucketRegion(region);
  }

  @Delete('regions/:id')
  public async deleteBucketRegion(@Param(ParseUUIDPipe) id: string): Promise<void> {
    return this.service.deleteBucketRegion(id);
  }

  @Get('regions/:id')
  public async getBucketRegion(@Param(ParseUUIDPipe) id: string): Promise<CnBucketRegion> {
    return this.service.getBucketRegion(id);
  }

  @Get('regions')
  public async getBucketRegions(@Query('page', ParseIntPipe) page: number,
                                @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnBucketRegion>> {
    return this.service.getBucketRegions(page, size);
  }

  ////////////////////////////// CREDENTIALS //////////////////////////////

  @Post('credentials')
  public async createBucketCredentials(@Body() credentials: CnBucketCredentials): Promise<CnBucketCredentials> {
    return this.service.createBucketCredentials(credentials);
  }

  @Put('credentials')
  public async updateBucketCredentials(@Body() credentials: CnBucketCredentials): Promise<CnBucketCredentials> {
    return this.service.updateBucketCredentials(credentials);
  }

  @Delete('credentials/:id')
  public async deleteBucketCredentials(@Param(ParseUUIDPipe) id: string): Promise<void> {
    return this.service.deleteBucketCredentials(id);
  }

  @Get('credentials/:id')
  public async getBucketCredentials(@Param(ParseUUIDPipe) id: string): Promise<CnBucketCredentials> {
    return this.service.getBucketCredentials(id);
  }

  @Get('credentials')
  public async getBucketCredentialsList(@Query('page', ParseIntPipe) page: number,
                                        @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnBucketCredentials>> {
    return this.service.getAllBucketCredentials(page, size);
  }

}
