import {FlEntity, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

export interface CaSmartDbDoc extends FlEntity {
  title: string;
  source: 'PubMed';
  authors: string[];
  date: string;
  doi: string;
  urlPath: string;
  content: string;
  sentences: CaSmartDbSentence[];
}

export interface CaSmartDbDocSearchResult extends CaSmartDbDoc {
  contentHighlight: string[];
  titleHighlights: CaMatchPosition[];
  sentences: CaSmartDbSentenceSearchResult[];
}

export interface CaSmartDbSentence {
  parts: CaSmartDbSentencePart[];
  context: string[];
  sentence: string;
}

export interface CaSmartDbSentenceSearchResult extends CaSmartDbSentence {
  sentenceHighlights: CaMatchPosition[];
}


export type CaSmartDbEffect = 'Positive' | 'Negative' | 'Neutral';

export interface CaSmartDbSentencePart {
  subject: string[];
  verb: string;
  object: string;
  type: CaSmartDbEffect;
  humanValidated: boolean;
}

export interface CaMatchPosition {
  offset: number;
  length: number;
}


export type CaSmartDbDocSearchDatasource = FlEntityPaginatedDatasource<CaSmartDbDocSearchResult>;
