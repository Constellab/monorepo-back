import {FlApiModuleConfig, FlPage} from '@monorepo/front-core-lib';
import {environment} from '../../../environments/environment';
import {ClCoreJsonConvert} from '@monorepo/core-lib';
import {ApiErrorService} from '../service/api-error.service';

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
  }
}

export const apiModuleConfig: FlApiModuleConfig = {
  apiUrl: environment.apiUrl,
  defaultApiErrorDuration: 3000,
  errorApiService: ApiErrorService,
  pagination: {
    pageQueryParam: 'page',
    pageSizeQueryParam: 'number_of_items_per_page',
    deserializePage: (json: PaginatedResponse, classReference: new() => any): FlPage<any> => {
      // if the result if paginated (we supposed the json is type of FlPage)
      if (json.data != null && json.data instanceof Array) {
        return {
          first: json.paginator.is_first_page,
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
  }
};
