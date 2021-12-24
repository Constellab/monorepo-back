import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flDateI18nFr: FlLangTranslation = {
  flDate: {
    created_by: 'Created by',
    last_modified_by: 'Last modified by',
  }
};

const flDateI18nEn: FlLangTranslation = {
  flDate: {
    created_by: 'Créé par',
    last_modified_by: 'Dernière modification par',
  }
};

export const flDateI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flDateI18nEn,
  [ClSupportedLanguage.fr]: flDateI18nFr
};
