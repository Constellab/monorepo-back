import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flChartI18nFr: FlLangTranslation = {
  flChart: {
    export_chart: 'Exporter le graphique au format SVG',
    reset_zoom: 'Réinitialiser le zoom (double clique)',
    serie: 'Série',
    quartile_1: 'Q1',
    quartile_3: 'Q3',
    median: 'Médiane',
    min: 'Min',
    max: 'Max',
    LINE: 'Courbe',
    SCATTER_PLOT: 'Nuage de point',
    BAR_PLOT: 'Barres',
    HISTOGRAM: 'Histogramme',
    BOX_PLOT: 'Boîte à moustache',
    // Pathway
    pathway_links: 'Lien externes',
    pathway_link_value_help: 'Slider pour cacher les lien d\'une valeur inférieur à',
    pathway_link_color_normal: 'Couleurs linéaires',
    pathway_link_color_log: 'Couleurs logarithmes',
    pathway_select_sub_pathway: 'Sélectionner un pathway',
    pathway_open_config: 'Ouvrir les paramètres'
  }
};

const flChartI18nEn: FlLangTranslation = {
  flChart: {
    export_chart: 'Export chart as SVG file',
    reset_zoom: 'Reset zoom (double click)',
    serie: 'Serie',
    quartile_1: 'Q1',
    quartile_3: 'Q3',
    median: 'Median',
    min: 'Min',
    max: 'Max',
    LINE: 'Line',
    SCATTER_PLOT: 'Scatter plot',
    BAR_PLOT: 'Bar plot',
    HISTOGRAM: 'Histogram',
    BOX_PLOT: 'Box plot',
    // Pathway
    pathway_links: 'External links',
    pathway_link_value_help: 'Slide to hide link with a value lower than',
    pathway_link_color_normal: 'Linears colors',
    pathway_link_color_log: 'Logarithm colors',
    pathway_select_sub_pathway: 'Select a pathway',
    pathway_open_config: 'Open config'
  }
};

export const flChartI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flChartI18nEn,
  [ClSupportedLanguage.fr]: flChartI18nFr
};
