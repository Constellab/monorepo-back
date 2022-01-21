
export interface SnDocumentBase<T> {
  title: T;
  source: 'PubMed';
  authors: string;
  date: string;
  doi: string;
  urlPath: string;
  content: T;
  sentences: SnDocumentSentenceBase<T>[];
}

export type SnEffect = 'Positive' | 'Negative' | 'Neutral';
export interface SnDocumentSentenceBase<T> {
  subject: string[];
  verb: string;
  object: string[];
  context: string[];
  type: SnEffect[];
  sentence: T;
  humanValidated: boolean;
}


export type SnDocument = SnDocumentBase<string>;
export type SnDocumentSentence = SnDocumentSentenceBase<string>;

export type SnDocSearchResult = SnDocumentBase<SnSearchStringHighlight>;
export type SnDocSentenceSearchResult = SnDocumentSentenceBase<SnSearchStringHighlight>;


/**
 * Object to store a string along with the list of words that matched the string
 */
export interface SnSearchStringHighlight {
  value: string;
  // list of words that matched the value
  highlights: SnMatchPosition[];
}

export interface SnMatchPosition{
  offset: number;
  length: number;
}


export interface SnCsvImporter{
  subject: string;
  verb: string;
  object: string;
  context: string;
  type: string;
  sentence: string;
  source: 'PubMed';
  title: string;
  authors: string;
  date: string;
  doi: string;
  url_path: string;
}
