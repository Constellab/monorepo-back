import {Injectable} from '@nestjs/common';
import {I18nService} from 'nestjs-i18n';
import {TranslateOptions} from './translate-options.class';
import {SupportedLanguage} from '../../model/config/supported-language.class';
import {RequestContextHelper} from '../request-context/request-context.helper';
import {Observable} from 'rxjs';
import {fromPromise} from 'rxjs/internal-compatibility';

/**
 * Service to translate text from i18n folder
 */
@Injectable()
export class TranslateService {

  constructor(private i18nService: I18nService) {
  }

  public translate(key: string, options: TranslateOptions = {}): Promise<string> {
    const lang: SupportedLanguage = RequestContextHelper.getCurrentLang();

    return this.i18nService.translate(key, {
      lang: lang,
      args: options.args
    });
  }

  public translateObs(key: string, options: TranslateOptions = {}): Observable<string> {
    return fromPromise(this.translate(key, options));
  }
}
