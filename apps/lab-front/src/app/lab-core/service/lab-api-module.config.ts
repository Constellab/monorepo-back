import {FlApiServiceConfig} from '@monorepo/front-core-lib';
import {ClCoreJsonConvert, ClDeserializationRef, ClPageI} from '@monorepo/core-lib';
import {Injectable} from '@angular/core';
import {LabEnvStore} from './lab-env.store';
import {LabAppEnvironment} from '../model/global/lab-environment.class';
import {LabEnvironmentHelper} from '../utils/lab-environment.helper';

/**
 * Format of the paginated result
 */
interface LabPaginatedResponse {
  objects: any[];
  page: number;
  prev_page: number;
  next_page: number;
  last_page: number;
  total_number_of_items: number;
  total_number_of_pages: number;
  number_of_items_per_page: number;
  is_first_page: boolean;
  is_last_page: boolean;
  total_is_approximate?: boolean;
}

/**
 * Class to configure the FlApiService
 */
@Injectable({
  providedIn: 'root'
})
export class LabApiServiceConfig extends FlApiServiceConfig {

  constructor(private labEnvStore: LabEnvStore) {
    super();
  }

  deserializePage(json: LabPaginatedResponse, classReference: ClDeserializationRef): ClPageI<any> {
    // if the result if paginated (we supposed the json is type of ClPage)
    if (json.objects != null && json.objects instanceof Array) {
      return {
        first: json.page === 0,
        last: json.is_last_page,
        currentPage: json.page,
        pageSize: json.number_of_items_per_page,
        totalElements: json.total_number_of_items,
        objects: ClCoreJsonConvert.deserialize(json.objects, classReference),
        totalIsApproximate: json.total_is_approximate
      };
    } else {
      console.error('Response object not paginated');
      throw 'Response object not paginated';
    }
  }

  getApiUrl(): string {
    const env: LabAppEnvironment = this.labEnvStore.getLabEnvironment();
    if (env === 'dev') {
      return LabEnvironmentHelper.getDevCoreApiUrl();
    }

    return LabEnvironmentHelper.getCoreApiUrl();
  }

  getHeaders(): Record<string, string> {
    return {};
  }

  get pageQueryParam(): string {
    return 'page';
  }

  get pageSizeQueryParam(): string {
    return 'number_of_items_per_page';
  }


}
