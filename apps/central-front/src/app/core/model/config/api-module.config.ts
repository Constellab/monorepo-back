import {FlApiModuleConfig} from '@monorepo/front-core-lib';
import {environment} from '../../../../environments/environment';
import {ErrorService} from '../../service/error.service';
import {ClCoreJsonConvert, ClDeserializationRef, ClPage} from '@monorepo/core-lib';

export const apiModuleConfig: FlApiModuleConfig = {
  apiUrl: environment.apiUrl,
  defaultApiErrorDuration: 3000,
  errorApiService: ErrorService,
  pagination: {
    pageQueryParam: 'page',
    pageSizeQueryParam: 'size',
    deserializePage: (json: any, classReference: ClDeserializationRef): ClPage<any> => {
      // if the result if paginated (we supposed the json is type of ClPage)
      if (json.objects != null && json.objects instanceof Array) {
        json.objects = ClCoreJsonConvert.deserialize(json.objects, classReference);
        return json;
      } else {
        console.error('Response object not paginated');
        throw 'Response object not paginated';
      }
    }
  }
};
