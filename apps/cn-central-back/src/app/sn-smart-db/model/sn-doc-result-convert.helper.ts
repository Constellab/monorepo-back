import {
  SnDocSearchResult,
  SnDocSentenceSearchResult,
  SnDocument,
  SnDocumentSentence,
  SnMatchPosition
} from './sn-document.class';
import {ClStringHelper} from '@monorepo/core-lib';
import {SnElasticsearchHit} from './sn-elasticsearch.class';


export class SnDocResultConvertHelper {
  public static convertHitsToDocsSearch(hits: SnElasticsearchHit<SnDocument>[], words: string[] = []): SnDocSearchResult[] {
    return hits.map(hit => this.convertHitToDocSearch(hit, words));
  }

  public static convertHitToDocSearch(hit: SnElasticsearchHit<SnDocument>, words: string[] = []): SnDocSearchResult {
    const document = hit._source;
    return Object.assign(document, {
      id: hit._id,
      titleHighlights: this.getStringMathPosition(document.title, words),
      sentences: document.sentences.map(sentence => this.convertDocSentenceToDocSentenceSearch(sentence, words)),
      contentHighlight: hit.highlight?.content ?? []
    });
  }

  private static convertDocSentenceToDocSentenceSearch(sentence: SnDocumentSentence, words: string[]): SnDocSentenceSearchResult {
    return Object.assign(sentence, {
      sentenceHighlights: this.getStringMathPosition(sentence.sentence, words),
    });
  }


  private static getStringMathPosition(value: string, words: string[]): SnMatchPosition[] {
    const matches: SnMatchPosition[] = [];

    for (const word of words) {
      const indexes = ClStringHelper.getIndicesOf(word, value);

      for (const index of indexes) {
        matches.push({
          offset: index,
          length: word.length
        });
      }
    }

    return matches;
  }
}
