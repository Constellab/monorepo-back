import { ClSupportedLanguage } from '@monorepo/core-lib';

export const BL_TRANSLATE_CONFIG_PROVIDER = Symbol();

export interface BlTranslateConfig {
  getCurrentUserLang: () => ClSupportedLanguage | null;
}

export interface BlTranslatableText {
  text: string;
  translate: boolean;
}
