import {FlApiServiceConfig} from '@monorepo/front-core-lib';
import {environment} from '../../../../environments/environment';
import {ClCoreJsonConvert, ClDeserializationRef, ClPage} from '@monorepo/core-lib';
import {Injectable} from '@angular/core';

/**
 * Class to configure the FlApiService
 */
@Injectable({
  providedIn: 'root'
})
export class ApiServiceConfig extends FlApiServiceConfig {
  deserializePage(json: any, classReference: ClDeserializationRef): ClPage<any> {
    // if the result if paginated (we supposed the json is type of ClPage)
    if (json.objects != null && json.objects instanceof Array) {
      json.objects = ClCoreJsonConvert.deserialize(json.objects, classReference);
      return json;
    } else {
      console.error('Response object not paginated');
      throw 'Response object not paginated';
    }
  }

  getApiUrl(): string {
    return environment.apiUrl;
  }

  getHeaders(): Record<string, string> {
    return undefined;
  }

  get pageQueryParam(): string {
    return 'page';
  }

  get pageSizeQueryParam(): string {
    return 'size';
  }


}
