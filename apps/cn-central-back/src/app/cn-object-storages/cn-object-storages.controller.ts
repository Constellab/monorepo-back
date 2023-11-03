import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query} from '@nestjs/common';
import {CnObjectStoragesAggregateService} from './cn-object-storages-aggregate.service';
import {CnBucket} from './cn-buckets/cn-bucket.entity';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CnBucketCredentials} from './cn-bucket-credential/cn-bucket-credential.entity';
import {CnBucketCredentialsFull} from './cn-object-storage.dto';
import {BlCredentials, BlParsePipe, BlSearchParams} from '@monorepo/back-core-lib';


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

  @Post('buckets/search')
  searchBuckets(@Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
                @Query('page', ParseIntPipe) page: number,
                @Query('size', ParseIntPipe) size: number): Promise<ClPageI<CnBucket>> {
    return this.service.searchBuckets(searchParam, page, size);
  }

  ////////////////////////////// CREDENTIALS //////////////////////////////

  @Post('credentials')
  public async createBucketCredentials(@Body(new BlParsePipe(CnBucketCredentials)) credentials: CnBucketCredentials)
    : Promise<CnBucketCredentials> {
    return await this.service.createBucketCredentials(credentials);
  }

  @Put('credentials')
  public async updateBucketCredentials(@Body(new BlParsePipe(CnBucketCredentials)) credentials: CnBucketCredentials)
    : Promise<CnBucketCredentials> {
    return await this.service.updateBucketCredentials(credentials);
  }

  @Delete('credentials/:id')
  public async deleteBucketCredentials(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.service.deleteBucketCredentials(id);
  }

  @Get('credentials')
  public async getAllBucketCredentials(@Query('page', ParseIntPipe) page: number,
                                       @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnBucketCredentials>> {
    return await this.service.getAllBucketCredentials(page, size);
  }

  @Get('credentials/current-space')
  public async getBucketCredentialsBySpace(@Query('page', ParseIntPipe) page: number,
                                           @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnBucketCredentials>> {
    return await this.service.getAllBucketCredentialsByCurrentSpace(page, size);
  }

  @Post('credentials/:id/data')
  public async getCredentialsData(@Param('id', new ParseUUIDPipe()) id: string,
                                  @Body() credentials: BlCredentials): Promise<CnBucketCredentialsFull> {
    return await this.service.getCredentialsData(id, credentials);
  }
}
