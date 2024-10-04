import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BlTranslateOptions } from './bl-translate-options.class';
import { from, Observable } from 'rxjs';
import { ClSupportedLanguage } from '@monorepo/core-lib';
import { BlCurrentUserHelper } from '../bl-jwt/bl-current-user.helper';

/**
 * Service to translate text from i18n folder
 */
@Injectable()
export class BlTranslateService {

  constructor(private i18nService: I18nService) {
  }

  public translateIfExists(key: string, options: BlTranslateOptions = {}): Promise<string> {
    const lang: ClSupportedLanguage = BlCurrentUserHelper.getCurrentLang();

    return this.i18nService.translate(key, {
      lang: lang,
      args: options.args,
      defaultValue: key // use default value to return the key if the translation is not found
    });
  }

  public translateObs(key: string, options: BlTranslateOptions = {}): Observable<string> {
    return from(this.translateIfExists(key, options));
  }
}
