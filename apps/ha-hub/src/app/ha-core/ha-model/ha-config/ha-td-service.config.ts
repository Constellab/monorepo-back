/**
 * Class to configure the TdService
 */
import {Injectable} from '@angular/core';
import {
  TdServiceConfig,
  TdTechnicalDocUrl
} from '@monorepo/technical-doc';
import {HaBrickRouteService} from '../../ha-service/ha-brick-route-service.service';

@Injectable({
  providedIn: 'root'
})
export class HaTdServiceConfig extends TdServiceConfig{
  getTechnicalDocUrl(parentBrickName:string, parentVersion:string, objectType:string, docParentUniqueName:string): TdTechnicalDocUrl {
    return {
      url : HaBrickRouteService.getTecDocUrl(parentBrickName, parentVersion, objectType, docParentUniqueName),
      isAbsolute: false
    };
  }

}
