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
    lower_whisker: 'Moustache basse',
    upper_whisker: 'Moustache haute',
    min: 'Min',
    max: 'Max',
    LINE: 'Courbe',
    SCATTER_PLOT: 'Nuage de point',
    BAR_PLOT: 'Barres',
    HISTOGRAM: 'Histogramme',
    BOX_PLOT: 'Boîte à moustache',
    HEAT_MAP: 'Heat map',
    number_of_data: 'Nb de données',
    interval: 'Interval',
    value: 'Valeur'
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
    lower_whisker: 'Lower whisker',
    upper_whisker: 'Upper whisker',
    min: 'Min',
    max: 'Max',
    LINE: 'Line',
    SCATTER_PLOT: 'Scatter plot',
    BAR_PLOT: 'Bar plot',
    HISTOGRAM: 'Histogram',
    BOX_PLOT: 'Box plot',
    HEAT_MAP: 'Heat map',
    number_of_data: 'Nb of data',
    interval: 'Interval',
    value: 'Value'
  }
};

export const flChartI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flChartI18nEn,
  [ClSupportedLanguage.fr]: flChartI18nFr
};
