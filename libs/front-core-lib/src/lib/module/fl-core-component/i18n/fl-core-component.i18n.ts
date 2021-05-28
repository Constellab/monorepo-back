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
  }
};

const flCoreComponentI18nEn: FlLangTranslation = {
  flCoreComponent: {
    see_more: 'See more',
    hide: 'Hide',
  }
};

export const flCoreComponentI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flCoreComponentI18nEn,
  [ClSupportedLanguage.fr]: flCoreComponentI18nFr
};
