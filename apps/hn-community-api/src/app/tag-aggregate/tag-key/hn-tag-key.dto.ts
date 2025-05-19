import { HnTagKey, HnTagKeyType } from './hn-tag-key.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { HnSpaceDto } from '../../space-aggregate/space/hn-space.dto';
import { HnTagCoAuthorDto } from '../tag-co-author/hn-tag-co-author.dto';
import { HnUserDto } from '../../users/hn-user.dto';
import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';

export class HnTagKeyDto extends BlEntityWithIdDTO {
  technicalName: string;
  label: string;
  type: HnTagKeyType;
  deprecated: boolean;
  publishedAt?: string;
  unit?: string;
  description?: TeRichTextDTO;
  scientificName?: string;
  additionalInfosSpecs?: Record<string, any>;
  space?: HnSpaceDto;
  tagCoAuthors?: HnTagCoAuthorDto[];
  createdAt?: string;
  createdBy?: HnUserDto;
  lastModifiedAt?: string;
  lastModifiedBy?: HnUserDto;

  constructor(tagKey: HnTagKey) {
    if (!tagKey) return;
    super();
    this.id = tagKey.id;
    this.technicalName = tagKey.technicalName;
    this.label = tagKey.label;
    this.type = tagKey.type;
    this.deprecated = tagKey.deprecated;
    this.publishedAt = tagKey.publishedAt?.toISO();
    this.unit = tagKey.unit;
    this.description = tagKey.description;
    this.scientificName = tagKey.scientificName;
    this.additionalInfosSpecs = tagKey.additionalInfosSpecs;
    this.space = tagKey.space ? new HnSpaceDto(tagKey.space) : null;
    this.tagCoAuthors = tagKey.tagCoAuthors?.map((tagCoAuthor) => new HnTagCoAuthorDto(tagCoAuthor));
    this.createdAt = tagKey.createdAt?.toISO();
    this.createdBy = tagKey.createdBy ? new HnUserDto(tagKey.createdBy) : null;
    this.lastModifiedAt = tagKey.lastModifiedAt?.toISO();
    this.lastModifiedBy = tagKey.lastModifiedBy ? new HnUserDto(tagKey.lastModifiedBy) : null;
  }
}

export class HnCreateTagKeyDto {
  id?: string;
  technicalName: string;
  label: string;
  type: HnTagKeyType;
  unit?: string;
  scientificName?: string;
  space?: string;
}
