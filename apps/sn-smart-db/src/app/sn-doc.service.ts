import {Injectable} from '@nestjs/common';
import {
  SnDocSearchResult,
  SnDocSentenceSearchResult,
  SnDocument,
  SnDocumentSentence,
  SnSearchStringHighlight
} from './model/sn-document.class';
import {ClPageI, ClStringHelper} from '@monorepo/core-lib';
import {SnDocElasticsearchService} from './sn-doc-elasticsearch.service';
import {SnDataImporterService} from './sn-data-importer.service';

@Injectable()
export class SnDocService {

  private static readonly MAX_PAGE_SIZE = 20;

  constructor(private docElasticsearchService: SnDocElasticsearchService,
              private dataImporter: SnDataImporterService) {
  }

  async createDocument(document: SnDocument): Promise<any> {
    return this.docElasticsearchService.createDocument(document);
  }

  async search(text: string, page: number, pageSize: number): Promise<ClPageI<SnDocSearchResult>> {
    const result: ClPageI<SnDocument> = await this.docElasticsearchService.search(text, page,
      Math.min(pageSize, SnDocService.MAX_PAGE_SIZE));

    return Object.assign(result, {objects: this.convertDocsToDocsSearch(result.objects, text.split(' '))});
  }

  private convertDocsToDocsSearch(documents: SnDocument[], words: string[]): SnDocSearchResult[] {
    return documents.map(document => this.convertDocToDocSearch(document, words));
  }

  private convertDocToDocSearch(document: SnDocument, words: string[]): SnDocSearchResult {
    return Object.assign(document, {
      title: this.convertStringToStringMatch(document.title, words),
      // todo use the real content
      content: this.convertStringToStringMatch(document.sentences.map(sentence => sentence.sentence).join(), words),
      sentences: document.sentences.map(sentence => this.convertDocSentenceToDocSentenceSearch(sentence, words))
    });
  }

  private convertDocSentenceToDocSentenceSearch(sentence: SnDocumentSentence, words: string[]): SnDocSentenceSearchResult {
    return Object.assign(sentence, {
      sentence: this.convertStringToStringMatch(sentence.sentence, words),
    });
  }


  private convertStringToStringMatch(value: string, words: string[]): SnSearchStringHighlight {
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

  async createIndex(): Promise<any> {
    return this.docElasticsearchService.addMapping();
  }

  async getIndex(index?: string): Promise<any> {
    return this.docElasticsearchService.getIndex(index);
  }

  async deleteIndex(): Promise<any> {
    return this.docElasticsearchService.deleteIndex();
  }

  public async init(file: any): Promise<any> {
    try {
      await this.docElasticsearchService.deleteIndex();
    } catch (_) {
    }

    await this.docElasticsearchService.addMapping();
    return await this.dataImporter.importDataFromFile(file);
  }
}
