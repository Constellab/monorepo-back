import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {ClGetPageFunction} from '@monorepo/core-lib';

export interface CaSmartDbDoc {
  // id: string;
  title: CaSearchStringHighlight;
  source: 'PubMed';
  authors: string;
  date: string;
  doi: string;
  urlPath: string;
  content: CaSearchStringHighlight;
  sentences: CaSmartDbSentence[];
}

export type CaSmartDbEffect = 'Positive' | 'Negative' | 'Neutral';

export interface CaSmartDbSentence {
  // id: string;
  subject: string[];
  verb: string;
  object: string[];
  context: string[];
  type: CaSmartDbEffect[];
  sentence: CaSearchStringHighlight;
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


export class CaSmartDbDocDatasource extends FlDatasourcePaginated<CaSmartDbDoc> {

  constructor(getPageFunction: ClGetPageFunction<CaSmartDbDoc>) {
    super(getPageFunction, 20, false);
  }

  protected equals(a: CaSmartDbDoc, b: CaSmartDbDoc): boolean {
    return a.doi === b.doi;
  }
}
