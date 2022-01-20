export interface SnDocument {
  // id: string;
  title: string;
  source: 'PubMed';
  authors: string;
  date: string;
  doi: string;
  urlPath: string;
  content: string;
  sentences: SnDocumentSentence[];
}

export type SnEffect = 'Positive' | 'Negative' | 'Neutral';

export interface SnDocumentSentence {
  // id: string;
  subject: string[];
  verb: string;
  object: string[];
  context: string[];
  type: SnEffect[];
  sentence: string;
  humanValidated: boolean;
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
  urlPath: string;
}
