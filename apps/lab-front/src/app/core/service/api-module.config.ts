import {FlApiServiceConfig} from '@monorepo/front-core-lib';
import {ClCoreJsonConvert, ClDeserializationRef, ClPage} from '@monorepo/core-lib';
import {Injectable} from '@angular/core';
import {LabEnvStore} from './lab-env.store';
import {LabEnvironment} from '../model/global/lab-environment.class';
import {EnvironmentHelper} from '../utils/environment.helper';

/**
 * Format of the paginated result
 */
interface PaginatedResponse {
  data: any[];
  paginator: {
    page: number;
    prev_page: number,
    next_page: number,
    last_page: number,
    number_of_items: number,
    total_number_of_pages: number,
    number_of_items_per_page: number,
    is_first_page: boolean,
    is_last_page: boolean
  };
}

/**
 * Class to configure the FlApiService
 */
@Injectable({
  providedIn: 'root'
})
export class ApiServiceConfig extends FlApiServiceConfig {

  constructor(private labEnvStore: LabEnvStore) {
    super();
  }

  deserializePage(json: PaginatedResponse, classReference: ClDeserializationRef): ClPage<any> {
    // if the result if paginated (we supposed the json is type of ClPage)
    if (json.data != null && json.data instanceof Array) {
      return {
        first: json.paginator.page === 1,
        last: json.paginator.is_last_page,
        currentPage: json.paginator.page,
        pageSize: json.paginator.number_of_items_per_page,
        totalElements: json.paginator.number_of_items,
        objects: ClCoreJsonConvert.deserialize(json.data, classReference),
      };
    } else {
      console.error('Response object not paginated');
      throw 'Response object not paginated';
    }
  }

  getApiUrl(): string {
    const env: LabEnvironment = this.labEnvStore.getLabEnvironment();
    if(env === 'dev'){
      return EnvironmentHelper.getDevCoreApiUrl();
    }

    return EnvironmentHelper.getCoreApiUrl();
  }

  getHeaders(): Record<string, string> {
    const token = this.labEnvStore.getToken();

    if (token) {
      return {Authorization: this.labEnvStore.getToken()};
    }

    return {};
  }

  get pageQueryParam(): string {
    return 'page';
  }

  get pageSizeQueryParam(): string {
    return 'number_of_items_per_page';
  }


}
