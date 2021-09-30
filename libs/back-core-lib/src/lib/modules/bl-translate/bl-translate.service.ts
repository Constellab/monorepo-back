import {Injectable} from '@nestjs/common';
import {I18nService} from 'nestjs-i18n';
import {BlTranslateOptions} from './bl-translate-options.class';
import {Observable} from 'rxjs';
import {fromPromise} from 'rxjs/internal-compatibility';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {BlCurrentUserHelper} from '../bl-jwt/bl-current-user.helper';

/**
 * Service to translate text from i18n folder
 */
@Injectable()
export class BlTranslateService {

  constructor(private i18nService: I18nService) {
  }

  public translate(key: string, options: BlTranslateOptions = {}): Promise<string> {
    const lang: ClSupportedLanguage = BlCurrentUserHelper.getCurrentLang();

    return this.i18nService.translate(key, {
      lang: lang,
      args: options.args
    });
  }

  public translateObs(key: string, options: BlTranslateOptions = {}): Observable<string> {
    return fromPromise(this.translate(key, options));
  }
}
