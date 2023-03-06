/**
 * Class to configure the TdService
 */
import {Injectable} from '@angular/core';
import {TdServiceConfig, TdTechnicalDocUrl, TdTypingName} from '@monorepo/technical-doc';
import {HaRouterService} from '../../ha-service/ha-router.service';

@Injectable({
  providedIn: 'root'
})
export class HaTdServiceConfig extends TdServiceConfig {

  getTechnicalDocUrl(parentVersion: string, typingName: TdTypingName): TdTechnicalDocUrl {

    return {
      url: HaRouterService.getTechnicalDocRoute(
        typingName.brickName,
        parentVersion.split('.')[0],
        typingName.type.toLowerCase(),
        typingName.uniqueName),
      isAbsolute: false
    };
  }

}
