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
      url: HaRouterService.getTechDocRoute(
        typingName.getBrickName(),
        parentVersion.split('.')[0],
        typingName.getType().toLowerCase(),
        typingName.getUniqueName()),
      isAbsolute: false
    };
  }

}
