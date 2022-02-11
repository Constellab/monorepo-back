import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flTextEditorI18nFr: FlLangTranslation = {
  flTextEditor: {
    title: 'Titre',
    caption: 'Légende',
    ok: 'Ok',
  }
};

const flTextEditorI18nEn: FlLangTranslation = {
  flTextEditor: {
    title: 'Title',
    caption: 'Caption',
    ok: 'Ok',
  }
};

export const flTextEditorI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flTextEditorI18nEn,
  [ClSupportedLanguage.fr]: flTextEditorI18nFr
};
