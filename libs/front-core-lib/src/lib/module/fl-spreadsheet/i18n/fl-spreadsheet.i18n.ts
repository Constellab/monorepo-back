import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flSpreadsheetI18nFr: FlLangTranslation = {
  MySuperTest: 'FR'
};

const flSpreadsheetI18nEn: FlLangTranslation = {
  MySuperTest: 'EN'
};

export const flSpreadSheetI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flSpreadsheetI18nEn,
  [ClSupportedLanguage.fr]: flSpreadsheetI18nFr
};
