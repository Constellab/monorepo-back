import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';
import {ClSupportedLanguage} from '@monorepo/core-lib';

/**
 * Translation file for the Spreadsheet module
 */
const rvResourceViewI18nFr: FlLangTranslation = {
  rvResourceView: {
    view_type_node_supported: 'La vue n\'est pas encore supportée, elle le sera très prochainement.',
    resource_view_json: 'Json',
    resource_view_text: 'Texte',
    resource_view_spreadsheet: 'Feuille de calcul',
    resource_view_dataset_view: 'Dataset',
    resource_view_pathway: 'Pathway',
    resource_view_image: 'Image',
    resource_view_scatter_plot_2d: 'Nuage de points 2d',
    resource_view_line_plot_2d: 'Courbe',
    resource_view_bar_plot: 'Barres',
    resource_view_stacked_bar_plot: 'Barres empilées',
    resource_view_histogram: 'Histogramme',
    resource_view_box_plot: 'Boîte à moustache',
    resource_view_multi_views: 'Vues multiple',
    resource_view_venn_diagram: 'Diagramme de venn',
    resource_view_heatmap: 'Heatmap',
    resource_view_vulcano_plot: 'Diagramme en volcan',
  }
};

const rvResourceViewI18nEn: FlLangTranslation = {
  rvResourceView: {
    view_type_node_supported: 'View not supported. It will be supported in a short notice',
    resource_view_json: 'Json',
    resource_view_text: 'Text',
    resource_view_spreadsheet: 'Spreadsheet',
    resource_view_dataset_view: 'Dataset',
    resource_view_pathway: 'Pathway',
    resource_view_image: 'Image',
    resource_view_scatter_plot_2d: 'Scatter plot 2d',
    resource_view_line_plot_2d: 'Line plot',
    resource_view_bar_plot: 'Bar plot',
    resource_view_stacked_bar_plot: 'Stacked bar plot',
    resource_view_histogram: 'Histogram',
    resource_view_box_plot: 'Box plot',
    resource_view_multi_views: 'Multi views',
    resource_view_venn_diagram: 'Venn diagram',
    resource_view_heatmap: 'Heatmap',
    resource_view_vulcano_plot: 'Vulcano plot',
  }
};

export const rvResourceViewI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: rvResourceViewI18nEn,
  [ClSupportedLanguage.fr]: rvResourceViewI18nFr
};
