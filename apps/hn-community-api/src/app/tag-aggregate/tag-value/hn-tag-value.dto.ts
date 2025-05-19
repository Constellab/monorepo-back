import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';
import { HnTagValue } from './hn-tag-value.entity';
import { HnTagKeyDto } from '../tag-key/hn-tag-key.dto';

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
