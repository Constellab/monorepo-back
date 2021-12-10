import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';

/**
 * Translation file for the Spreadsheet module
 */
const flSearchFr: FlLangTranslation = {
  flSearch: {
    count_result: '{{count}} Résultats'
  }
};

const flSearchEn: FlLangTranslation = {
  flSearch: {
    count_result: '{{count}} Results'
  }
};

export const flSearchI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flSearchFr,
  [ClSupportedLanguage.fr]: flSearchEn
};
