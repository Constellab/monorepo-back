import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flChartI18nFr: FlLangTranslation = {
  flChart: {
    pathway_links: 'Lien externes',
    pathway_link_value_help: 'Slider pour cacher les lien d\'une valeur inférieur à'
  }
};

const flChartI18nEn: FlLangTranslation = {
  flChart: {
    pathway_links: 'External links',
    pathway_link_value_help: 'Slide to hide link with a value lower than'
  }
};

export const flChartI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flChartI18nEn,
  [ClSupportedLanguage.fr]: flChartI18nFr
};
