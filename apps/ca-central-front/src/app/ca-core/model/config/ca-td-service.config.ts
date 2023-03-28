import {Injectable} from '@angular/core';
import {TdServiceConfig, TdTechnicalDocUrl, TdTypingName} from '@monorepo/technical-doc';
import {CaCommunityHelper} from '../../utils/ca-community.helper';

/**
 * Class to configure the TdService
 */
@Injectable({
  providedIn: 'root'
})
export class CaTdServiceConfig extends TdServiceConfig {

  getTechnicalDocUrl(parentVersion: string, typingName: TdTypingName): TdTechnicalDocUrl {

    return {
      isAbsolute: true,
      url: CaCommunityHelper.getTechnicalDocUrl(typingName.brickName, parentVersion, typingName)
    };

  }

}
