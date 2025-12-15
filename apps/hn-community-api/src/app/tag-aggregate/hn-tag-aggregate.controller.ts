import { BlParsePipe, BlPublic, BlSearchSortCriteria } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnTagAggregateService } from './hn-tag-aggregate.service';
import { HnCreateTagKeyDto, HnTagKeyDto } from './tag-key/hn-tag-key.dto';
import { HnTagKey, HnTagKeyAdditionalInfosSpecs, HnTagParamSpec } from './tag-key/hn-tag-key.entity';
import { HnEditTagValueDto, HnTagValueDto } from './tag-value/hn-tag-value.dto';

@Controller('tag')
export class HnTagAggregateController {
  constructor(private readonly tagAggregateService: HnTagAggregateService) {}

  @BlPublic()
  @Get('all-map')
  findAllMap(): Promise<HnSitemapItemBase[]> {
    return this.tagAggregateService.findAllMap();
  }

  @BlPublic()
  @Get('public')
  async getPublicTagKeys(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnTagKeyDto>> {
    const tagKeys: ClPage<HnTagKey> = await this.tagAggregateService.getAllTagKeysWithFilters(
      ['public'],
      '',
      '',
      [],
      page,
      size
    );
    return tagKeys.map((tagKey) => new HnTagKeyDto(tagKey));
  }

  @BlPublic()
  @Post(':tagKeyId/value/filters')
  async getTagValuesByTagKeyId(
    @Param('tagKeyId') tagKeyId: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnTagValueDto>> {
    const tagValues = await this.tagAggregateService.getTagValuesByTagKeyId(tagKeyId, page, size);
    return tagValues.map((tagValue) => new HnTagValueDto(tagValue));
  }

  @BlPublic()
  @Get(':tagKeyId/value/count')
  getTagValuesCountByTagKeyId(@Param('tagKeyId') tagKeyId: string): Promise<number> {
    return this.tagAggregateService.getTagValuesCountByTagKeyId(tagKeyId);
  }

  @BlPublic()
  @Get(':id')
  async getTagKeyById(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnTagKeyDto> {
    const tagKey = await this.tagAggregateService.getTagKeyById(id);
    return new HnTagKeyDto(tagKey);
  }

  @BlPublic()
  @Get()
  async getAllTagKeys(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnTagKeyDto>> {
    const tagKeys: ClPage<HnTagKey> = await this.tagAggregateService.getAllTagKeysWithFilters(
      [],
      '',
      '',
      [],
      page,
      size
    );
    return tagKeys.map((tagKey) => new HnTagKeyDto(tagKey));
  }

  @BlPublic()
  @Post('filters')
  async getAllTagKeysWithFilters(
    @Body('technicalNameFilter') technicalNameFilter: string,
    @Body('spacesFilter') spacesFilter: string[],
    @Body('labelFilter') labelFilter: string,
    @Body('sorts') sortsCriteria: BlSearchSortCriteria[],
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnTagKeyDto>> {
    const tagKeys: ClPage<HnTagKey> = await this.tagAggregateService.getAllTagKeysWithFilters(
      spacesFilter,
      technicalNameFilter,
      labelFilter,
      sortsCriteria,
      page,
      size
    );
    return tagKeys.map((tagKey) => new HnTagKeyDto(tagKey));
  }

  @Post(':id/value')
  async createTagValue(
    @Param('id') id: string,
    @Body(new BlParsePipe(HnEditTagValueDto)) createTagValueDto: HnEditTagValueDto
  ): Promise<HnTagValueDto> {
    const tagValue = await this.tagAggregateService.createTagValue(id, createTagValueDto);
    return new HnTagValueDto(tagValue);
  }

  @Put(':id/value')
  async getTagValueById(
    @Param('id') id: string,
    @Body(new BlParsePipe(HnEditTagValueDto)) updateTagValueDto: HnEditTagValueDto
  ): Promise<HnTagValueDto> {
    const tagValue = await this.tagAggregateService.updateTagValue(id, updateTagValueDto);
    return new HnTagValueDto(tagValue);
  }

  @Post()
  async createTagKey(
    @Body(new BlParsePipe(HnCreateTagKeyDto)) createTagKeyDto: HnCreateTagKeyDto
  ): Promise<HnTagKeyDto> {
    const tagKey = await this.tagAggregateService.createTagKey(createTagKeyDto);
    return new HnTagKeyDto(tagKey);
  }

  @Put('description/:id')
  async updateTagKeyDescription(
    @Param('id') id: string,
    @Body('description') description: TeRichTextDTO
  ): Promise<HnTagKeyDto> {
    const tagKey = await this.tagAggregateService.updateTagKeyDescription(id, description);
    return new HnTagKeyDto(tagKey);
  }

  @Post('additional-info-spec/:technicalName')
  async createAdditionalInfoSpec(
    @Param('technicalName') technicalName: string,
    @Body('specName') specName: string,
    @Body('spec') spec: HnTagParamSpec
  ): Promise<HnTagKeyAdditionalInfosSpecs> {
    return await this.tagAggregateService.createAdditionalInfoSpec(technicalName, specName, spec);
  }

  @Put('additional-info-spec/:technicalName/:specName')
  async updateAdditionalInfoSpec(
    @Param('technicalName') technicalName: string,
    @Param('specName') specName: string,
    @Body() spec: HnTagParamSpec
  ): Promise<HnTagKeyAdditionalInfosSpecs> {
    return this.tagAggregateService.updateAdditionalInfoSpec(technicalName, specName, spec);
  }

  @Put('additional-info-spec/:technicalName/:oldName/:newName')
  async renameAndEditAdditionalInfoSpec(
    @Param('technicalName') technicalName: string,
    @Param('oldName') oldName: string,
    @Param('newName') newName: string,
    @Body() spec: HnTagParamSpec
  ): Promise<HnTagKeyAdditionalInfosSpecs> {
    return this.tagAggregateService.renameAndEditAdditionalInfoSpec(technicalName, oldName, newName, spec);
  }

  @Delete('additional-info-spec/:technicalName/:specName')
  async deleteAdditionalInfoSpec(
    @Param('technicalName') technicalName: string,
    @Param('specName') specName: string
  ): Promise<HnTagKeyAdditionalInfosSpecs> {
    return await this.tagAggregateService.deleteAdditionalInfoSpec(technicalName, specName);
  }

  @Put('publish/:id')
  async publishTagKey(@Param('id') id: string): Promise<HnTagKeyDto> {
    const tagKey = await this.tagAggregateService.publishTagKey(id);
    return new HnTagKeyDto(tagKey);
  }

  @Put(':id/value/:tagValueId')
  async updateTagValue(
    @Param('id') id: string,
    @Param('tagValueId') tagValueId: string,
    @Body(new BlParsePipe(HnEditTagValueDto)) updateTagValueDto: HnEditTagValueDto
  ): Promise<HnTagValueDto> {
    const tagValue = await this.tagAggregateService.updateTagValue(id, updateTagValueDto);
    return new HnTagValueDto(tagValue);
  }

  @Delete(':id/value/:tagValueId')
  async deleteTagValue(
    @Param('id') id: string,
    @Param('tagValueId') tagValueId: string
  ): Promise<HnTagValueDto> {
    const tagValue = await this.tagAggregateService.deleteTagValue(id, tagValueId);
    return new HnTagValueDto(tagValue);
  }

  @Delete(':id')
  async deleteTagKey(@Param('id') id: string): Promise<HnTagKeyDto> {
    const tagKey = await this.tagAggregateService.deleteTagKey(id);
    return new HnTagKeyDto(tagKey);
  }

  @Put()
  async updateTagKey(
    @Body(new BlParsePipe(HnCreateTagKeyDto)) updateTagKeyDto: HnCreateTagKeyDto
  ): Promise<HnTagKeyDto> {
    const tagKey = await this.tagAggregateService.updateTagKey(updateTagKeyDto);
    return new HnTagKeyDto(tagKey);
  }
}
