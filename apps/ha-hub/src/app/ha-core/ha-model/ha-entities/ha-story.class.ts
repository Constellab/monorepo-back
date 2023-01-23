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

export class HaStory{
  id: string;
  title: string;
  content: CmRichTextI;

  firstParagraph: string;

  status: HaStoryStatus;

  mainPicture?: string;

  topics?: HaTopic[];

  @Type(() => HaUser)
  createdBy: HaUser;

  createdAt: DateTime;
}

export class HaCreateStoryDto{
  title: string;
}

export class HaListStoryDto{
  id: string;
  title: string;
  firstParagraph: string;
  mainPicture?: string;
  topics?: HaTopic[];
  createdAt: DateTime;

  @Type(() => HaUser)
  createdBy: HaUser;
}

export class HaStoryDataSourceDataDto{
  id: string;
  title: string;

  status: HaStoryStatus;
  createdAt: DateTime;

  @Type(() => HaUser)
  createdBy: HaUser;
}

export type HaStoryDatasourcePaginated = FlDatasourcePaginated<HaListStoryDto>;

export type HaMyStoriesDataSource = FlDatasourcePaginated<HaStoryDataSourceDataDto>;

export class HaStoryContentFormDTO extends HaEntity {
  content: CmRichTextI;
}
