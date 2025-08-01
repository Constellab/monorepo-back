import { clDefaultLang, ClSupportedLanguage } from '@monorepo/core-lib';
import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { from, Observable } from 'rxjs';

import { BlRequestContextHelper } from '../bl-request-context/bl-request-context.helper';
import { BL_TRANSLATE_CONFIG_PROVIDER, BlTranslateConfig } from './bl-translate.class';
import { BlTranslateOptions } from './bl-translate-options.class';

/**
 * Service to translate text from i18n folder
 */
@Injectable()
export class BlTranslateService {
  constructor(
    private i18nService: I18nService,
    @Inject(BL_TRANSLATE_CONFIG_PROVIDER) private moduleConfig: BlTranslateConfig
  ) {}

  public translateIfExists(key: string, options: BlTranslateOptions = {}): Promise<string> {
    const lang: ClSupportedLanguage =
      options.lang ??
      this.moduleConfig.getCurrentUserLang() ??
      BlRequestContextHelper.getLangHeader() ??
      clDefaultLang;

    return this.i18nService.translate(key, {
      lang: lang,
      args: options.args,
      defaultValue: key, // use default value to return the key if the translation is not found
    });
  }

  public translateObs(key: string, options: BlTranslateOptions = {}): Observable<string> {
    return from(this.translateIfExists(key, options));
  }
}
