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
import { HnTagAggregateService } from './hn-tag-aggregate.service';
import { HnCreateTagKeyDto, HnTagKeyDto } from './tag-key/hn-tag-key.dto';
import { BlParsePipe, BlPublic } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { HnTagKey, HnTagKeyEditAdditionalInfoSpec } from './tag-key/hn-tag-key.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { HnEditTagValueDto, HnTagValueDto } from './tag-value/hn-tag-value.dto';

@Controller('tag')
export class HnTagAggregateController {
  constructor(private readonly tagAggregateService: HnTagAggregateService) {}

  @BlPublic()
  @Get('public')
  async getPublicTagKeys(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnTagKeyDto>> {
    const tagKeys: ClPage<HnTagKey> = await this.tagAggregateService.getAllTagKeysWithFilters(
      ['public'],
      '',
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
      page,
      size
    );
    return tagKeys.map((tagKey) => new HnTagKeyDto(tagKey));
  }

  @BlPublic()
  @Post('filters')
  async getAllTagKeysWithFilters(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('labelFilter') labelFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnTagKeyDto>> {
    const tagKeys: ClPage<HnTagKey> = await this.tagAggregateService.getAllTagKeysWithFilters(
      spacesFilter,
      labelFilter,
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

  @Post('additional-info-spec/:id')
  async createAdditionalInfoSpec(
    @Param('id') id: string,
    @Body() additionalInfoSpec: HnTagKeyEditAdditionalInfoSpec
  ): Promise<HnTagKeyDto> {
    const tagKey = await this.tagAggregateService.createAdditionalInfoSpec(id, additionalInfoSpec);
    return new HnTagKeyDto(tagKey);
  }

  @Put('additional-info-spec/:id')
  async updateAdditionalInfoSpec(
    @Param('id') id: string,
    @Body() additionalInfoSpec: HnTagKeyEditAdditionalInfoSpec
  ): Promise<HnTagKeyDto> {
    const tagKey = await this.tagAggregateService.updateAdditionalInfoSpec(id, additionalInfoSpec);
    return new HnTagKeyDto(tagKey);
  }

  @Delete('additional-info-spec/:id/:additionalInfoSpecName')
  async deleteAdditionalInfoSpec(
    @Param('id') id: string,
    @Param('additionalInfoSpecName') additionalInfoSpecName: string
  ): Promise<HnTagKeyDto> {
    const tagKey = await this.tagAggregateService.deleteAdditionalInfoSpec(id, additionalInfoSpecName);
    return new HnTagKeyDto(tagKey);
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
