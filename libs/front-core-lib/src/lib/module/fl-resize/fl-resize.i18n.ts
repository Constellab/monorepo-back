import {ClSupportedLanguage} from '@monorepo/core-lib';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flResizeI18nFr: FlLangTranslation = {
  flResize: {
    set_fullscreen: "Plein écran",
    remove_fullscreen: "Enlever le plein écran"
  }
};

const flResizeI18nEn: FlLangTranslation = {
  flResize: {
    set_fullscreen: "Fullscreen",
    remove_fullscreen: "Remove fullscreen"
  }
};

export const flResizeI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flResizeI18nEn,
  [ClSupportedLanguage.fr]: flResizeI18nFr
};
