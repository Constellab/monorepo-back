import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { HnTagAggregateService } from './hn-tag-aggregate.service';
import { ClPage } from '@monorepo/core-lib';
import { HnTagKeyForLabDto } from './tag-key/hn-tag-key.dto';
import { HnTagKey } from './tag-key/hn-tag-key.entity';
import { HnLabGuard } from '../core/decorators/hn-lab-auth-guard.decorator';
import { HnTagValueForLabDto } from './tag-value/hn-tag-value.dto';
import { HnTagValue } from './tag-value/hn-tag-value.entity';

@HnLabGuard()
@Controller('tag/for-lab')
export class HnTagAggregateLabController {
  constructor(private readonly tagAggregateService: HnTagAggregateService) {}

  @Post('available')
  async getTagsForLab(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('technicalNameFilter') technicalNameFilter: string,
    @Body('labelFilter') labelFilter: string,
    @Body('personalOnly') personalOnly: boolean,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnTagKeyForLabDto>> {
    const tagKeys: ClPage<HnTagKey> = await this.tagAggregateService.getAllTagKeysWithFiltersForLab(
      spacesFilter,
      technicalNameFilter,
      labelFilter,
      page,
      size,
      personalOnly
    );
    return tagKeys.map((tagKey) => new HnTagKeyForLabDto(tagKey));
  }

  @Get('key/:technicalName/values/all')
  async getAllTagValuesForLab(@Param('technicalName') technicalName: string): Promise<HnTagValueForLabDto[]> {
    const tagValues: HnTagValue[] =
      await this.tagAggregateService.getAllTagValuesByTagKeyTechnicalName(technicalName);
    return tagValues.map((tagValue) => new HnTagValueForLabDto(tagValue));
  }

  @Get('key/:technicalName/values')
  async getTagValuesForLab(
    @Param('technicalName') technicalName: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnTagValueForLabDto>> {
    const tagValues: ClPage<HnTagValue> = await this.tagAggregateService.getTagValuesByTagKeyTechnicalName(
      technicalName,
      page,
      size,
      false
    );
    return tagValues.map((tagValue) => new HnTagValueForLabDto(tagValue));
  }

  @Get('key/:technicalName/value/:valueId')
  async getTagValueForLab(
    @Param('technicalName') technicalName: string,
    @Param('valueId') valueId: string
  ): Promise<HnTagValueForLabDto> {
    const tagValue: HnTagValue = await this.tagAggregateService.getTagValue(technicalName, valueId);
    if (!tagValue) {
      return null;
    }
    return new HnTagValueForLabDto(tagValue);
  }

  @Get('key/:technicalName')
  async getTagKeyForLab(@Param('technicalName') technicalName: string): Promise<HnTagKeyForLabDto> {
    const tagKey: HnTagKey = await this.tagAggregateService.getTagKeyByTechnicalName(technicalName);
    return new HnTagKeyForLabDto(tagKey);
  }

  @Post('share')
  async shareTagToCommunity(
    @Body('tagKey') tagKey: HnTagKeyForLabDto,
    @Body('tagValues') tagValues: HnTagValueForLabDto[],
    @Body('spaceId') spaceId?: string
  ): Promise<HnTagKeyForLabDto> {
    const tagKeyEntity: HnTagKey = await this.tagAggregateService.shareTagToCommunity(
      tagKey,
      tagValues,
      spaceId
    );
    return new HnTagKeyForLabDto(tagKeyEntity);
  }
}
