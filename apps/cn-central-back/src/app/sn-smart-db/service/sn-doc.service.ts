import {Injectable} from '@nestjs/common';
import {ClPageI} from '@monorepo/core-lib';
import {SnDocElasticsearchService} from './sn-doc-elasticsearch.service';
import {SnDataImporterService} from './sn-data-importer.service';
import {SnDocSearchResult, SnDocument, SnSmartDbExport} from '../model/sn-document.class';
import {BlFile} from '@monorepo/back-core-lib';

@Injectable()
export class SnDocService {

  private static readonly MAX_PAGE_SIZE = 20;

  constructor(private docElasticsearchService: SnDocElasticsearchService,
              private dataImporter: SnDataImporterService) {
  }

  async validateDoc(index: string, doc: SnDocument): Promise<SnDocument> {
    // check that the doc exits
    await this.findByIdAndCheck(index, doc.id);

    for (const sentence of doc.sentences) {
      for (const part of sentence.parts) {
        part.humanValidated = true;
      }
    }

    return this.docElasticsearchService.updateDocument(index, doc);
  }


  async findByIdAndCheck(index: string, docId: string): Promise<SnDocument> {
    return this.docElasticsearchService.findByIdAndCheck(index, docId);
  }

  async search(index: string, text: string, page: number, pageSize: number): Promise<ClPageI<SnDocSearchResult>> {
    return this.docElasticsearchService.search(index, text, page,
      Math.min(pageSize, SnDocService.MAX_PAGE_SIZE));
  }

  async findNotValidated(index: string, page: number, pageSize: number): Promise<ClPageI<SnDocument>> {
    return this.docElasticsearchService.findNotValidated(index, page, pageSize);
  }

  async getIndex(index?: string): Promise<any> {
    return this.docElasticsearchService.getIndex(index);
  }

  /**
   * Create the document in DB if it doesn't exist, do nothing otherwise
   */
  public async createDocumentIfNotExist(index: string, document: SnDocument): Promise<SnDocument> {
    const docDb: SnDocument = await this.docElasticsearchService.findByUrlPath(index, document.urlPath);

    if (docDb == null) {
      return this.docElasticsearchService.createDocument(index, document);
    }

    return docDb;
  }

  public async importDataFromFile(index: string, file: BlFile): Promise<SnDocument[]> {
    const documents: SnDocument[] = this.dataImporter.importDataFromFile(file);

    for (const document of documents) {
      await this.createDocumentIfNotExist(index, document);
    }

    return documents;
  }

  public async init(index: string, file: any): Promise<any> {
    if (await this.docElasticsearchService.indexExists(index)) {
      await this.docElasticsearchService.deleteIndex(index);
    }
    await this.docElasticsearchService.createIndex(index);
    return await this.importDataFromFile(index, file);
  }

  public async exportData(index: string): Promise<SnSmartDbExport> {
    const docs = await this.docElasticsearchService.findAll(index);
    return {
      version: 0,
      documents: docs
    };
  }
}
