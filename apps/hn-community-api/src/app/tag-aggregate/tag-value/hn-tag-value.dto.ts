import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';

import { HnTagKeyDto, HnTagKeyForLabDto } from '../tag-key/hn-tag-key.dto';
import { HnTagValue } from './hn-tag-value.entity';

export class HnTagValueDto extends BlEntityWithIdDTO {
  value: string;
  deprecated: boolean;
  tagKey: HnTagKeyDto;
  shortDescription?: string;
  additionalInfos?: Record<string, any>;

  constructor(tagValue: HnTagValue) {
    if (!tagValue) return;
    super();
    this.id = tagValue.id;
    this.value = tagValue.value;
    this.deprecated = tagValue.deprecated;
    this.tagKey = tagValue.tagKey ? new HnTagKeyDto(tagValue.tagKey) : null;
    this.shortDescription = tagValue.shortDescription;
    this.additionalInfos = tagValue.additionalInfos;
  }
}

export class HnEditTagValueDto {
  id?: string;
  value: string;
  shortDescription?: string;
  additionalInfos?: Record<string, any>;
}

export class HnTagValueForLabDto {
  id: string;
  value: string;
  deprecated: boolean;
  short_description?: string;
  additional_infos?: Record<string, any>;
  tag_key: HnTagKeyForLabDto;

  constructor(tagValue: HnTagValue) {
    if (!tagValue) return;
    this.id = tagValue.id;
    this.value = tagValue.value;
    this.deprecated = tagValue.deprecated;
    this.short_description = tagValue.shortDescription;
    this.additional_infos = tagValue.additionalInfos;
    this.tag_key = tagValue.tagKey ? new HnTagKeyForLabDto(tagValue.tagKey) : null;
  }
}
