import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flJsonEditorI18nFr: FlLangTranslation = {
  flJsonEditor: {
    object_not_supported: 'Object non supporté',
  }
};

const flJsonEditorI18nEn: FlLangTranslation = {
  flJsonEditor: {
    object_not_supported: 'Object not supported',
  }
};

export const flJsonEditorI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flJsonEditorI18nEn,
  [ClSupportedLanguage.fr]: flJsonEditorI18nFr
};
