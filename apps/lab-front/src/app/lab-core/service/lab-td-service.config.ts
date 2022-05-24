import {Injectable} from '@angular/core';
import {TdServiceConfig, TdTechnicalDocUrl} from '@monorepo/technical-doc';
import {LabRouterService} from './lab-router.service';

/**
 * Class to configure the TdModule
 */
@Injectable({
  providedIn: 'root'
})
export class LabTdServiceConfig extends TdServiceConfig {
  getTechnicalDocUrl(parentBrickName: string, parentVersion: string, objectType: string, docParentUniqueName: string): TdTechnicalDocUrl {
    return {
      url: LabRouterService.getTechnicalDocRoute(objectType + '.' + parentBrickName + '.' + docParentUniqueName),
      isAbsolute: false
    };
  }

}
