import {
  SnDocSearchResult,
  SnDocSentenceSearchResult,
  SnDocument,
  SnDocumentSentence,
  SnSearchStringHighlight
} from './sn-document.class';
import {ClStringHelper} from '@monorepo/core-lib';
import {SnElasticsearchHit} from './sn-elasticsearch.class';


export class SnDocResultConvertHelper{
  public static convertHitsToDocsSearch(hits: SnElasticsearchHit<SnDocument>[], words: string[] = []): SnDocSearchResult[] {
    return hits.map(hit => this.convertHitToDocSearch(hit, words));
  }

  public static convertHitToDocSearch(hit: SnElasticsearchHit<SnDocument>, words: string[] = []): SnDocSearchResult {
    const document = hit._source
    return Object.assign(document, {
      id: hit._id,
      title: this.convertStringToStringMatch(document.title, words),
      // todo use the real content
      content: this.convertStringToStringMatch(document.sentences.map(sentence => sentence.sentence).join(), words),
      sentences: document.sentences.map(sentence => this.convertDocSentenceToDocSentenceSearch(sentence, words)),
      contentHighlight: hit.highlight?.content ?? []
    });
  }

  private static convertDocSentenceToDocSentenceSearch(sentence: SnDocumentSentence, words: string[]): SnDocSentenceSearchResult {
    return Object.assign(sentence, {
      sentence: this.convertStringToStringMatch(sentence.sentence, words),
    });
  }


  private static convertStringToStringMatch(value: string, words: string[]): SnSearchStringHighlight {
    const result: SnSearchStringHighlight = {
      value: value,
      highlights: []
    };

    for (const word of words) {
      const indexes = ClStringHelper.getIndicesOf(word, value);

      for (const index of indexes) {
        result.highlights.push({
          offset: index,
          length: word.length
        });
      }
    }

    return result;
  }
}
