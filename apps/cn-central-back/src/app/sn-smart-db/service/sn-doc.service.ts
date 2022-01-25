import {Injectable} from '@nestjs/common';
import {ClPageI} from '@monorepo/core-lib';
import {SnDocElasticsearchService} from './sn-doc-elasticsearch.service';
import {SnDataImporterService} from './sn-data-importer.service';
import {SnDocSearchResult, SnDocument, SnSmartDbExport} from '../model/sn-document.class';

@Injectable()
export class SnDocService {

  private static readonly MAX_PAGE_SIZE = 20;

  constructor(private docElasticsearchService: SnDocElasticsearchService,
              private dataImporter: SnDataImporterService) {
  }

  // todo admin security
  async createDocument(document: SnDocument): Promise<any> {
    return this.docElasticsearchService.createDocument(document);
  }

  async findByIdAndCheck(id: string): Promise<SnDocSearchResult> {
    return this.docElasticsearchService.findByIdAndCheck(id);
  }

  async search(text: string, page: number, pageSize: number): Promise<ClPageI<SnDocSearchResult>> {
    return this.docElasticsearchService.search(text, page,
      Math.min(pageSize, SnDocService.MAX_PAGE_SIZE));
  }

  // todo admin security
  async createIndex(): Promise<any> {
    return this.docElasticsearchService.addMapping();
  }

  // todo admin security
  async getIndex(index?: string): Promise<any> {
    return this.docElasticsearchService.getIndex(index);
  }

  // todo admin security
  async deleteIndex(): Promise<any> {
    return this.docElasticsearchService.deleteIndex();
  }

  // todo admin security
  public async init(file: any): Promise<any> {
    try {
      await this.docElasticsearchService.deleteIndex();
    } catch (_) {
    }

    await this.docElasticsearchService.addMapping();
    return await this.dataImporter.importDataFromFile(file);
  }

  // todo ADMIN security
  public async exportData(): Promise<SnSmartDbExport> {
    const docs = await this.docElasticsearchService.findAll();
    return {
      version: 0,
      documents: docs
    };
  }
}
