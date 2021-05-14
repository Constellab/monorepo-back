import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';
import {ClSupportedLanguage} from '@monorepo/core-lib';

/**
 * Translation file for the Spreadsheet module
 */
const flFileInputFr: FlLangTranslation = {
  flFileInput: {
    files: 'fichiers',
    select_file: 'Sélectionner un fichier',
    select_files: 'Sélectionner des fichiers',
    clear_input: 'Enlever les fichiers'
  }
};

const flFileInputEn: FlLangTranslation = {
  flFileInput: {
    files: 'files',
    select_file: 'Select a file',
    select_files: 'Select files',
    clear_input: 'Remove files'
  }
};

export const flFileInputI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flFileInputFr,
  [ClSupportedLanguage.fr]: flFileInputEn
};
