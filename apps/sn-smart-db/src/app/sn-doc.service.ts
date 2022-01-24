import {Injectable} from '@nestjs/common';
import {SnDocSearchResult, SnDocument} from './model/sn-document.class';
import {ClPageI} from '@monorepo/core-lib';
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

  async findByIdAndCheck(id: string): Promise<SnDocSearchResult>{
    return this.docElasticsearchService.findByIdAndCheck(id)
  }

  async search(text: string, page: number, pageSize: number): Promise<ClPageI<SnDocSearchResult>> {
    return this.docElasticsearchService.search(text, page,
      Math.min(pageSize, SnDocService.MAX_PAGE_SIZE));
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
