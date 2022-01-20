import {Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import {SnDocument} from './model/sn-document.class';

@Injectable()
export class SnAppService {

  documents = 'documents';

  constructor(private elasticSearchService: ElasticsearchService) {
  }

  async createDocument(document: SnDocument): Promise<any> {
    return this.elasticSearchService.index({
      index: this.documents,
      body: document,
    });
  }

  async search(text: string): Promise<any> {
    const {body} = await this.elasticSearchService.search({
      index: this.documents,

      body: {
        query: {
          bool: {
            must: {
              multi_match: {
                query: text,
                type: 'best_fields',
                fields: ['title^3', 'content']
              },
            },
            filter: {
              match: {'sentences.verb': 'respectively'}
              // match: {date: '2019'}
            //   term: {doi: '10.1080/03601234.2019.1653735'},
            }
          }
        },
      }
    });
    const hits = body.hits.hits;
    return hits.map((item: any) => item._source);
  }

  async addMapping(): Promise<any> {
    await this.elasticSearchService.create({
      id: this.documents,
      index: this.documents,
      body: {}
    });

    await this.elasticSearchService.indices.putMapping({
      index: this.documents,
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

  async deleteIndex(index: string): Promise<any> {
    return this.elasticSearchService.indices.delete({index: index});
  }
}
