interface SnDocumentBase<T> {
  id: string;
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

interface SnDocumentSentenceBase<T> {
  parts: SnDocumentSentencePart[];
  context: string[];
  sentence: T;
}

export interface SnDocumentSentencePart {
  subject: string[];
  verb: string;
  object: string;
  type: SnEffect;
  humanValidated: boolean;
}


export type SnDocument = SnDocumentBase<string>;
export type SnDocumentSentence = SnDocumentSentenceBase<string>;

export interface SnDocSearchResult extends SnDocumentBase<SnSearchStringHighlight> {
  contentHighlight: string[];
}

export type SnDocSentenceSearchResult = SnDocumentSentenceBase<SnSearchStringHighlight>;


/**
 * Object to store a string along with the list of words that matched the string
 */
export interface SnSearchStringHighlight {
  value: string;
  // list of words that matched the value
  highlights: SnMatchPosition[];
}

export interface SnMatchPosition {
  offset: number;
  length: number;
}


export interface SnCsvImporter {
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
