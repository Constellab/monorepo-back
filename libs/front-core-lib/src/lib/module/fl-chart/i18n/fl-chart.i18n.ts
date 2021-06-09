import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flChartI18nFr: FlLangTranslation = {
  flChart: {
    pathway_links: 'Lien externes',
    pathway_link_value_help: 'Slider pour cacher les lien d\'une valeur inférieur à',
    pathway_link_color_normal: 'Couleurs linéaires',
    pathway_link_color_log: 'Couleurs logarithmes',
    export_chart: 'Exporter le graphique au format SVG',
    reset_zoom: 'Réinitialiser le zoom (double clique)'

  }
};

const flChartI18nEn: FlLangTranslation = {
  flChart: {
    pathway_links: 'External links',
    pathway_link_value_help: 'Slide to hide link with a value lower than',
    pathway_link_color_normal: 'Linears colors',
    pathway_link_color_log: 'Logarithm colors',
    export_chart: 'Export chart as SVG file',
    reset_zoom: 'Reset zoom (double click)'
  }
};

export const flChartI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flChartI18nEn,
  [ClSupportedLanguage.fr]: flChartI18nFr
};
