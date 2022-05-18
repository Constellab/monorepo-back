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
    hint_classic: 'Aide',
    hint_warning: 'Warning',
    hint_scientific: 'Info scientifique',
    move_block: 'Drag to move'
  }
};

const flTextEditorI18nEn: FlLangTranslation = {
  flTextEditor: {
    title: 'Title',
    caption: 'Caption',
    ok: 'Ok',
    hint_classic: 'Hint',
    hint_warning: 'Warning',
    hint_scientific: 'Scientific info',
    move_block: 'Glisser pour déplacer'
  }
};

export const flTextEditorI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flTextEditorI18nEn,
  [ClSupportedLanguage.fr]: flTextEditorI18nFr
};
