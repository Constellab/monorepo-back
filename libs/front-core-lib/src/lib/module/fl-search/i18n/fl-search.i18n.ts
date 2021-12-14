import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';

/**
 * Translation file for the Spreadsheet module
 */
const flSearchFr: FlLangTranslation = {
  flSearch: {
    count_result: '{{count}} Résultats',
    between_the_from: 'Du',
    between_the_to: 'au',
    begin_date: 'Date de début',
    end_date: 'Date de fin'
  }
};

const flSearchEn: FlLangTranslation = {
  flSearch: {
    count_result: '{{count}} Results',
    between_the_from: 'From the',
    between_the_to: 'to the',
    begin_date: 'Start date',
    end_date: 'End date'
  }
};

export const flSearchI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flSearchEn,
  [ClSupportedLanguage.fr]: flSearchFr
};
