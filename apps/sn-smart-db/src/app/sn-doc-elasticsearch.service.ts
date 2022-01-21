import {Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import {SnDocument} from './model/sn-document.class';
import {ClPageI} from '@monorepo/core-lib';
import {SnElasticsearchResult} from './model/sn-elasticsearch.class';


@Injectable()
export class SnDocElasticsearchService {

  private static readonly DOCUMENT_INDEX = 'documents';

  constructor(private elasticSearchService: ElasticsearchService) {
  }

  async createDocument(document: SnDocument): Promise<any> {
    return this.elasticSearchService.index({
      index: SnDocElasticsearchService.DOCUMENT_INDEX,
      body: document,
    });
  }

  async search(text: string, page: number, pageSize: number): Promise<ClPageI<SnDocument>> {
    const {body} = await this.elasticSearchService.search<SnElasticsearchResult<SnDocument>>({
      index: SnDocElasticsearchService.DOCUMENT_INDEX,
      from: page * pageSize,
      size: pageSize,
      body: {
        query: {
          bool: {
            must: {
              multi_match: {
                query: text,
                type: 'best_fields',
                fields: ['title^3', 'content'],
              },
            },
            // filter: {
            //   match: {'sentences.verb': 'respectively'}
            // match: {date: '2019'}
            //   term: {doi: '10.1080/03601234.2019.1653735'},
            // }
          }
        },
        // highlight: {
        //   type: 'plain',
        //   fragment_size: 0,
        //   number_of_fragments: 100,
        //   fragmenter: 'simple',
        //   pre_tags: [''],
        //   post_tags: [''],
        //   fields: {
        //     title: {},
        //     content: {},
        //   }
        // }
      }
    });
    const results: SnDocument[] = [];

    for (const hit of body.hits.hits) {
      const doc: SnDocument = hit._source;
      results.push(doc);
    }

    const total: number = body.hits.total.value;
    return {
      pageSize: pageSize,
      first: page === 0,
      currentPage: page,
      // compare the last element position with the total number
      last: (page + 1) * pageSize >= total,
      totalElements: total,
      objects: results
    };
  }

  async addMapping(): Promise<any> {
    await this.elasticSearchService.create({
      id: SnDocElasticsearchService.DOCUMENT_INDEX,
      index: SnDocElasticsearchService.DOCUMENT_INDEX,
      body: {},
    });
    await this.elasticSearchService.indices.putMapping({
      index: SnDocElasticsearchService.DOCUMENT_INDEX,
      body: {
        properties: {
          title: {type: 'text'},
          source: {type: 'text'},
          authors: {type: 'text'},
          date: {type: 'text'},
          doi: {type: 'text'},
          urlPath: {type: 'text'},
          content: {type: 'text'},
          sentences: {
            properties: {
              subject: {type: 'text'},
              verb: {type: 'text'},
              object: {type: 'text'},
              context: {type: 'text'},
              type: {type: 'text'},
              sentence: {type: 'text'},
              humanValidated: {type: 'boolean'},
            }
          }
        }
      }
    });
  }

  async getIndex(index?: string): Promise<any> {
    if (index) {
      return this.elasticSearchService.indices.get({index: index});
    } else {
      return this.elasticSearchService.indices.get();
    }
  }

  async deleteIndex(): Promise<any> {
    return this.elasticSearchService.indices.delete({index: SnDocElasticsearchService.DOCUMENT_INDEX});
  }

}
