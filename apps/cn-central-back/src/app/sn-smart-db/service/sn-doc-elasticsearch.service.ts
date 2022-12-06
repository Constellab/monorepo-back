import {Injectable, NotFoundException} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import {ClPageI} from '@monorepo/core-lib';
import {SnDocSearchResult, SnDocument} from '../model/sn-document.class';
import {SnElasticsearchHit, SnElasticsearchResult} from '../model/sn-elasticsearch.class';
import {SnDocResultConvertHelper} from '../model/sn-doc-result-convert.helper';


@Injectable()
export class SnDocElasticsearchService {

  constructor(private elasticSearchService: ElasticsearchService) {
  }

  async createDocument(index: string, document: SnDocument): Promise<any> {
    return this.elasticSearchService.index({
      index: index,
      body: document,
    });
  }

  async updateDocument(index: string, document: SnDocument): Promise<SnDocument> {
    const id = document.id;
    delete document.id;
    await this.elasticSearchService.index({
      index: index,
      id: id,
      body: document,

    });

    // force to refresh the index to have data up to date
    await this.elasticSearchService.indices.refresh({index: index});
    return Object.assign(document, {id: id});
  }

  async findById(index: string, id: string): Promise<SnDocument | null> {
    return this.findOne(index, {_id: id});
  }

  async findByIdAndCheck(index: string, id: string): Promise<SnDocument> {
    const doc = await this.findById(index, id);

    if (doc == null) {
      throw new NotFoundException('Document not found');
    }
    return doc;
  }

  async findByUrlPath(index: string, urlPath: string): Promise<SnDocument | null> {
    return this.findOne(index, {urlPath: {value: urlPath}});
  }

  async findNotValidated(index: string, page: number, pageSize: number): Promise<ClPageI<SnDocument>> {
    const {body} = await this.elasticSearchService.search<SnElasticsearchResult<SnDocument>>({
      index: index,
      from: page * pageSize,
      size: pageSize,
      body: {
        query: {
          bool: {
            must: {
              match: {'sentences.parts.humanValidated': false}
            },
          }
        }
      }
    });
    const results: SnDocument[] = SnDocResultConvertHelper.convertHitsToDocs(body.hits.hits);

    const total: number = body.hits.total.value;
    return SnDocResultConvertHelper.convertToPage(results, page, pageSize, total);
  }

  async findAll(index: string): Promise<SnDocument[]> {
    const {body} = await this.elasticSearchService.search({
      index: index,
      body: {
        query: {
          match_all: {},
        },
      },
      size: 10000 // max value
    });

    const hits: SnElasticsearchHit<SnDocument>[] = body.hits.hits;

    return SnDocResultConvertHelper.convertHitsToDocs(hits);
  }

  async search(index: string, text: string, page: number, pageSize: number): Promise<ClPageI<SnDocSearchResult>> {
    const {body} = await this.elasticSearchService.search<SnElasticsearchResult<SnDocument>>({
      index: index,
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
    return SnDocResultConvertHelper.convertToPage(results, page, pageSize, total);
  }

  async createIndex(index: string): Promise<any> {
    await this.elasticSearchService.indices.create({
      index: index
    });

    await this.elasticSearchService.indices.putMapping({
      index: index,
      body: {
        properties: {
          title: {type: 'text'},
          source: {type: 'keyword'},
          authors: {type: 'text'},
          date: {type: 'text'},
          doi: {type: 'keyword'},
          urlPath: {type: 'keyword'},
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

  async indexExists(index: string): Promise<boolean> {
    const result = await this.elasticSearchService.indices.exists({index: index});
    return result.body;
  }

  async deleteIndex(index: string): Promise<any> {
    return this.elasticSearchService.indices.delete({index: index});
  }

  private async findOne(index: string, filters: Record<string, any>): Promise<SnDocument | null> {
    const {body} = await this.elasticSearchService.search({
      index: index,
      body: {
        query: {
          term: filters
        }
      }
    });

    const hit: SnElasticsearchHit = body.hits.hits[0];
    if (hit == null) return null;

    return SnDocResultConvertHelper.convertHitToDoc(hit);
  }

}
