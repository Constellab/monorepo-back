import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/* eslint-disable max-len */
/**
 * Translation file for the Spreadsheet module
 */
const flCoreComponentI18nFr: FlLangTranslation = {
  flCoreComponent: {
    see_more: 'Voir plus',
    hide: 'Cacher',
    byte_symbol: 'B',
    kilo_byte_symbole: 'KB',
    mega_byte_symbole: 'MB',
    giga_byte_symbole: 'GB',
  }
};

const flCoreComponentI18nEn: FlLangTranslation = {
  flCoreComponent: {
    see_more: 'See more',
    hide: 'Hide',
    byte_symbol: 'o',
    kilo_byte_symbole: 'Ko',
    mega_byte_symbole: 'Mo',
    giga_byte_symbole: 'Go',
  }
};

export const flCoreComponentI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flCoreComponentI18nEn,
  [ClSupportedLanguage.fr]: flCoreComponentI18nFr
};
