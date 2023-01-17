import {CmRichTextI} from '@monorepo/common-model';
import {HaTopic, } from './ha-topic.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';

export enum HaStoryStatus{
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export class HaStory{
  id: string;
  title: string;
  content: CmRichTextI;

  status: HaStoryStatus;

  mainPicture?: string;

  topics?: HaTopic[];
}

export class HaCreateStoryDto{
  title: string;
}

export type HaStoryDatasourcePaginated = FlDatasourcePaginated<HaStory>;
