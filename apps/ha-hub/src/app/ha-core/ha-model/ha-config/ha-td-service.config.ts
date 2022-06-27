/**
 * Class to configure the TdService
 */
import {Injectable} from '@angular/core';
import {
  TdServiceConfig,
  TdTechnicalDocUrl, TdTypingName
} from '@monorepo/technical-doc';
import {HaBrickRouteService} from '../../ha-service/ha-brick-route-service.service';

@Injectable({
  providedIn: 'root'
})
export class HaTdServiceConfig extends TdServiceConfig{
  getTechnicalDocUrl(parentVersion:string, typingName: TdTypingName): TdTechnicalDocUrl {
    return {
      url : HaBrickRouteService.getTecDocUrl(
        typingName.getBrickName(),
        'v' + parentVersion.split('.')[0],
        typingName.getType().toLowerCase(),
        typingName.getUniqueName()),
      isAbsolute: false
    };
  }

}
