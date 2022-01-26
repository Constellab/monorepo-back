import {Injectable} from '@nestjs/common';
import {ClPageI} from '@monorepo/core-lib';
import {SnDocElasticsearchService} from './sn-doc-elasticsearch.service';
import {SnDataImporterService} from './sn-data-importer.service';
import {SnDocSearchResult, SnDocument, SnSmartDbExport} from '../model/sn-document.class';
import {CnAdminAuthorization} from '../../cn-core/security/cn-admin.authorization';

@Injectable()
export class SnDocService {

  private static readonly MAX_PAGE_SIZE = 20;

  constructor(private docElasticsearchService: SnDocElasticsearchService,
              private dataImporter: SnDataImporterService) {
  }

  async validateDoc(doc: SnDocument): Promise<SnDocument> {
    this.checkIsAdmin();

    // check that the doc exits
    await this.findByIdAndCheck(doc.id);

    for (const sentence of doc.sentences) {
      for (const part of sentence.parts) {
        part.humanValidated = true;
      }
    }

    return this.docElasticsearchService.updateDocument(doc);
  }


  async findByIdAndCheck(id: string): Promise<SnDocument> {
    return this.docElasticsearchService.findByIdAndCheck(id);
  }

  async search(text: string, page: number, pageSize: number): Promise<ClPageI<SnDocSearchResult>> {
    return this.docElasticsearchService.search(text, page,
      Math.min(pageSize, SnDocService.MAX_PAGE_SIZE));
  }

  async findNotValidated(page: number, pageSize: number): Promise<ClPageI<SnDocument>> {
    this.checkIsAdmin();

    return this.docElasticsearchService.findNotValidated(page, pageSize);
  }

  async createIndex(): Promise<any> {
    this.checkIsAdmin();

    return this.docElasticsearchService.createIndex();
  }

  async getIndex(index?: string): Promise<any> {
    this.checkIsAdmin();

    return this.docElasticsearchService.getIndex(index);
  }

  async deleteIndex(): Promise<any> {
    this.checkIsAdmin();

    return this.docElasticsearchService.deleteIndex();
  }

  public async init(file: any): Promise<any> {
    this.checkIsAdmin();
    try {
      await this.docElasticsearchService.deleteIndex();
    } catch (_) {
    }

    await this.docElasticsearchService.createIndex();
    return await this.dataImporter.importDataFromFile(file);
  }

  public async exportData(): Promise<SnSmartDbExport> {
    this.checkIsAdmin();
    const docs = await this.docElasticsearchService.findAll();
    return {
      version: 0,
      documents: docs
    };
  }

  private checkIsAdmin(): void {
    new CnAdminAuthorization().checkAuthorization();
  }
}
