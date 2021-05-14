import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';
import {ClSupportedLanguage} from '@monorepo/core-lib';

/**
 * Translation file for the Spreadsheet module
 */
const flPortalActionFr: FlLangTranslation = {
  flPortalAction: {
    actions: 'Actions'
  }
};

const flPortalActionEn: FlLangTranslation = {
  flPortalAction: {
    actions: 'Actions'
  }
};

export const flPortalActionI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flPortalActionFr,
  [ClSupportedLanguage.fr]: flPortalActionEn
};
