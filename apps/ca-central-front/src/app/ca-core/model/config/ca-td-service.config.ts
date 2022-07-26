/**
 * Class to configure the TdService
 */
import {Injectable} from '@angular/core';
import {TdServiceConfig, TdTechnicalDocUrl, TdTypingName} from '@monorepo/technical-doc';
import {environment} from '../../../../environments/ca-environment';

@Injectable({
  providedIn: 'root'
})
export class CaTdServiceConfig extends TdServiceConfig {

  getTechnicalDocUrl(parentVersion: string, typingName: TdTypingName): TdTechnicalDocUrl {

    return {
      isAbsolute: true,
      url: `${environment.hubUrl}bricks/${typingName.brickName}/v${parentVersion.split('.')[0]}/doc/` +
        `technical-folder/${typingName.type.toLowerCase()}/${typingName.uniqueName}`
    }

  }

}
