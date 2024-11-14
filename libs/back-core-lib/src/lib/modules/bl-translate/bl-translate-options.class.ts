import { ClSupportedLanguage } from '@monorepo/core-lib';

/**
 * Option for the translate method of the {@link BlTranslateService}
 */
export interface BlTranslateOptions {
  args?: ({ [k: string]: any } | string)[] | { [k: string]: any };
  lang?: ClSupportedLanguage;
}
