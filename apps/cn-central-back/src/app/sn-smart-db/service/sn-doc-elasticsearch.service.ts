import {Injectable, NotFoundException} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import {ClPageI} from '@monorepo/core-lib';
import {SnDocSearchResult, SnDocument} from '../model/sn-document.class';
import {SnElasticsearchHit, SnElasticsearchResult} from '../model/sn-elasticsearch.class';
import {SnDocResultConvertHelper} from '../model/sn-doc-result-convert.helper';


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

  async findById(id: string): Promise<SnDocSearchResult | null> {
    const {body} = await this.elasticSearchService.search({
      index: SnDocElasticsearchService.DOCUMENT_INDEX,
      body: {
        query: {
          terms: {
            _id: [id]
          }
        }
      }
    });

    const hit: SnElasticsearchHit = body.hits.hits[0];
    if (hit == null) return null;

    return SnDocResultConvertHelper.convertHitToDocSearch(hit);
  }

  async findByIdAndCheck(id: string): Promise<SnDocSearchResult> {
    const doc = await this.findById(id);

    if (doc == null) {
      throw new NotFoundException('Document not found');
    }
    return doc;
  }

  async findAll(): Promise<SnDocument[]> {
    const {body} = await this.elasticSearchService.search({
      index: SnDocElasticsearchService.DOCUMENT_INDEX,
      body: {
        query: {
          match_all: {}
        }
      }
    });

    const hits: SnElasticsearchHit<SnDocument>[] = body.hits.hits;
    // set the id
    return hits.map(hit => Object.assign(hit._source, {id: hit._id}));
  }

  async search(text: string, page: number, pageSize: number): Promise<ClPageI<SnDocSearchResult>> {
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
        highlight: {
          // type: 'plain',
          fragment_size: 150,
          number_of_fragments: 2,
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
          fields: {
            content: {},
          }
        }
      }
    });
    const results: SnDocSearchResult[] = SnDocResultConvertHelper.convertHitsToDocsSearch(
      body.hits.hits, text.split(' '));

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

  async createIndex(): Promise<any> {
    await this.elasticSearchService.indices.create({
      index: SnDocElasticsearchService.DOCUMENT_INDEX
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
              sentence: {type: 'text'},
              parts: {
                properties: {
                  subject: {type: 'text'},
                  verb: {type: 'text'},
                  object: {type: 'text'},
                  context: {type: 'text'},
                  type: {type: 'text'},
                  humanValidated: {type: 'boolean'},
                }
              },
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
