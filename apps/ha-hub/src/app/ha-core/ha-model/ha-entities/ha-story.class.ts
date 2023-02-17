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


export enum HaStoryAuthorStatus{
  AUTHOR = 'AUTHOR',
  COAUTHOR = 'COAUTHOR'
}

export class HaStoryAuthor{
  id: string;
  status: HaStoryAuthorStatus;

  @Type(() => HaUser)
  user: HaUser;

  story: HaStory;
}

export class HaStory{
  id: string;
  title: string;
  content: CmRichTextI;

  firstParagraph: string;

  status: HaStoryStatus;

  mainPicture?: string;

  topics: HaTopic[] = [];

  @Type(() => HaStoryAuthor)
  storyAuthors: HaStoryAuthor[];

  createdAt: DateTime;

  category: HaStoryCategory;

  publishedAt: DateTime;

  lastModifiedAt: DateTime;

  getAuthor(): HaUser{
    return this.storyAuthors.filter(storyAuthor => storyAuthor.status === HaStoryAuthorStatus.AUTHOR)[0].user;
  }
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

  @Type(() => HaStoryAuthor)
  storyAuthors: HaStoryAuthor[];

  publishedAt: DateTime;
  lastModifiedAt: DateTime;

  getAuthor(): HaUser{
    return this.storyAuthors.filter(storyAuthor => storyAuthor.status === HaStoryAuthorStatus.AUTHOR)[0].user;
  }
}

export class HaStoryDataSourceDataDto{
  id: string;
  title: string;

  category: HaStoryCategory;

  status: HaStoryStatus;
  createdAt: DateTime;

  @Type(() => HaStoryAuthor)
  storyAuthors: HaStoryAuthor[];

  publishedAt: DateTime;
  lastModifiedAt: DateTime;

  topics?: HaTopic[];

  getAuthor(): HaUser{
    return this.storyAuthors.filter(storyAuthor => storyAuthor.status === HaStoryAuthorStatus.AUTHOR)[0].user;
  }
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
