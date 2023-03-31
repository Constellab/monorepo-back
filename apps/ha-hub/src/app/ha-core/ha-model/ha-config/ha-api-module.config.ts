import {FlApiServiceConfig} from '@monorepo/front-core-lib';
import {ClCoreJsonConvert, ClDeserializationRef, ClPageI} from '@monorepo/core-lib';
import {Injectable} from '@angular/core';
import {HaEnvironmentHelper} from './ha-environment.helper';

/**
 * Class to configure the FlApiService
 */
@Injectable({
  providedIn: 'root'
})
export class HaApiServiceConfig extends FlApiServiceConfig {
  deserializePage(json: any, classReference: ClDeserializationRef): ClPageI<any> {
    // if the result is paginated (we supposed the json is type of ClPage)
    if (json.objects != null && json.objects instanceof Array) {
      json.objects = ClCoreJsonConvert.deserialize(json.objects, classReference);
      return json;
    } else {
      throw 'Response object not paginated';
    }
  }

  getApiUrl(): string {
    return HaEnvironmentHelper.getApiUrl() + '/';
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
