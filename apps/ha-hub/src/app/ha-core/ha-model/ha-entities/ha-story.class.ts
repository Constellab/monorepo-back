import {CmRichTextI} from '@monorepo/common-model';
import {HaTopic, } from './ha-topic.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {HaEntity} from './ha-entity.class';
import {HaUser} from './ha-user';
import { Type } from 'class-transformer';
import {DateTime} from 'luxon';

export enum HaStoryStatus{
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export enum HaStoryCategory{
  DOCUMENTATION = 'DOCUMENTATION',
  PRODUCT_DOCUMENTATION = 'PRODUCT_DOCUMENTATION',
  USE_CASE = 'USE_CASE',
  ARTICLE = 'ARTICLE'
}

export class HaStory{
  id: string;
  title: string;
  content: CmRichTextI;

  firstParagraph: string;

  status: HaStoryStatus;

  mainPicture?: string;

  topics: HaTopic[] = [];

  @Type(() => HaUser)
  createdBy: HaUser;

  createdAt: DateTime;

  category: HaStoryCategory;

  publishedAt: DateTime;

  lastModifiedAt: DateTime;
}

export class HaCreateStoryDto{
  title: string;

  category: HaStoryCategory;

}

export class HaListStoryDto{
  id: string;
  title: string;
  firstParagraph: string;
  mainPicture?: string;
  topics?: HaTopic[];
  createdAt: DateTime;

  category: HaStoryCategory;

  @Type(() => HaUser)
  createdBy: HaUser;

  publishedAt: DateTime;
  lastModifiedAt: DateTime;
}

export class HaStoryDataSourceDataDto{
  id: string;
  title: string;

  category: HaStoryCategory;

  status: HaStoryStatus;
  createdAt: DateTime;

  @Type(() => HaUser)
  createdBy: HaUser;

  publishedAt: DateTime;
  lastModifiedAt: DateTime;

  topics?: HaTopic[];
}

export class HaStoryFilter{
  title: string;
  categories: string[];
  topics: string[];

  constructor() {
    this.categories = [];
    this.topics = [];
    this.title = '';
  }
}

export type HaStoryDatasourcePaginated = FlDatasourcePaginated<HaListStoryDto>;

export type HaMyStoriesDataSource = FlDatasourcePaginated<HaStoryDataSourceDataDto>;

export class HaStoryContentFormDTO extends HaEntity {
  content: CmRichTextI;
}
