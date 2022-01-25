import {FlEntity, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

export interface CaSmartDbDoc extends FlEntity {
  title: CaSearchStringHighlight;
  source: 'PubMed';
  authors: string;
  date: string;
  doi: string;
  urlPath: string;
  content: CaSearchStringHighlight;
  sentences: CaSmartDbSentence[];
  contentHighlight: string[];
}

export interface CaSmartDbSentence {
  parts: CaSmartDbSentencePart[];
  context: string[];
  sentence: CaSearchStringHighlight;
}


export type CaSmartDbEffect = 'Positive' | 'Negative' | 'Neutral';

export interface CaSmartDbSentencePart {
  subject: string[];
  verb: string;
  object: string;
  type: CaSmartDbEffect;
  humanValidated: boolean;
}


/**
 * Object to store a string along with the list of words that matched the string
 */
export interface CaSearchStringHighlight {
  value: string;
  // list of words that matched the value
  highlights: CaMatchPosition[];
}

export interface CaMatchPosition {
  offset: number;
  length: number;
}


export type CaSmartDbDocDatasource = FlEntityPaginatedDatasource<CaSmartDbDoc>;
