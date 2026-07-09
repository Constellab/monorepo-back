import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

import { HnSpaceDto, HnSpaceForLabDto } from '../../space-aggregate/space/hn-space.dto';
import { HnUserDto } from '../../users/hn-user.dto';
import { HnTagCoAuthorDto } from '../tag-co-author/hn-tag-co-author.dto';
import { HnTagKey, HnTagKeyType } from './hn-tag-key.entity';

export class HnTagKeyDto extends BlEntityWithIdDTO {
  technicalName!: string;
  label!: string;
  type!: HnTagKeyType;
  deprecated!: boolean;
  likes!: number;
  comments!: number;
  publishedAt?: string;
  unit?: string;
  description?: TeRichTextDTO;
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
    this.publishedAt = tagKey.publishedAt?.toISO() ?? undefined;
    this.unit = tagKey.unit;
    this.description = tagKey.description;
    this.additionalInfosSpecs = tagKey.additionalInfosSpecs;
    this.space = tagKey.space ? new HnSpaceDto(tagKey.space) : undefined;
    this.tagCoAuthors = tagKey.tagCoAuthors?.map((tagCoAuthor) => new HnTagCoAuthorDto(tagCoAuthor));
    this.createdAt = tagKey.createdAt?.toISO() ?? undefined;
    this.createdBy = tagKey.createdBy ? new HnUserDto(tagKey.createdBy) : undefined;
    this.lastModifiedAt = tagKey.lastModifiedAt?.toISO() ?? undefined;
    this.lastModifiedBy = tagKey.lastModifiedBy ? new HnUserDto(tagKey.lastModifiedBy) : undefined;
    this.likes = tagKey.likes ?? 0;
    this.comments = tagKey.comments ?? 0;
  }
}

export class HnCreateTagKeyDto {
  id?: string;
  technicalName!: string;
  label!: string;
  type!: HnTagKeyType;
  unit?: string;
  scientificName?: string;
  space?: string;
}

export class HnTagKeyForLabDto {
  id: string;
  key: string;
  label: string;
  value_format: HnTagKeyType;
  deprecated: boolean;
  published_at?: string;
  unit?: string;
  description?: TeRichTextDTO;
  space?: HnSpaceForLabDto;
  tag_co_authors?: HnUserDto[];
  created_at?: string;
  created_by?: HnUserDto;
  last_modified_at?: string;
  last_modified_by?: HnUserDto;
  additional_infos_specs?: Record<string, any>;

  constructor(tagKey: HnTagKey) {
    this.id = tagKey.id;
    this.key = tagKey.technicalName;
    this.label = tagKey.label;
    this.value_format = tagKey.type;
    this.deprecated = tagKey.deprecated;
    this.published_at = tagKey.publishedAt?.toISO() ?? undefined;
    this.unit = tagKey.unit;
    this.description = tagKey.description;
    this.space = tagKey.space ? { id: tagKey.space.id, name: tagKey.space.name } : undefined;
    this.tag_co_authors = tagKey.tagCoAuthors?.map((tagCoAuthor) => new HnUserDto(tagCoAuthor.user));
    this.created_at = tagKey.createdAt?.toISO() ?? undefined;
    this.created_by = tagKey.createdBy ? new HnUserDto(tagKey.createdBy) : undefined;
    this.last_modified_at = tagKey.lastModifiedAt?.toISO() ?? undefined;
    this.last_modified_by = tagKey.lastModifiedBy ? new HnUserDto(tagKey.lastModifiedBy) : undefined;
    this.additional_infos_specs = tagKey.additionalInfosSpecs;
  }
}
