import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flSpreadsheetI18nFr: FlLangTranslation = {
  flSpreadsheet: {
    add: 'Add',
    delete: 'Delete',
    copy: 'Copier',
    paste: 'Coller',
    create_chart: 'Créer un graphique',
    create_chart_validate: 'Valider',
    chart_type: 'Graphique',
    chart_serie_selection_x: 'Valeurs de la série des abscisses X',
    chart_serie_selection_y: 'Valeurs de la série des ordonnées Y',
    series_name: 'Noms des séries',
    serie_name: 'Nom de la série',
    x_labels: 'Labels des abscisses',
    multiple_series_data_wrong_format: 'Format incorrect. Exemple: A1:A2,B1:B2',
    single_serie_data_wrong_format: 'Format incorrect. Exemple: A1:B2',
    selection_out_of_bound: 'La sélection dépasse la taille du tableau',
    chart_data_selection_tooltip: 'Cliquez pour sélection les cellules',
    chart_data_range: 'Plage de données du graphique',
    chart_add_serie: 'Ajouter une série',
    chart_update_serie: 'Modifier la série',
    chart_delete_serie: 'Supprimer la série',
    chart_serie_selection: 'Sélection de la série',
    chart_serie: 'Série',
    chart_series: 'Séries'
  }
};

const flSpreadsheetI18nEn: FlLangTranslation = {
  flSpreadsheet: {
    add: 'Add',
    delete: 'Delete',
    copy: 'Copy',
    paste: 'Paste',
    create_chart: 'Create a chart',
    create_chart_validate: 'Validate',
    chart_type: 'Chart',
    chart_serie_selection_x: 'X abscissa values of the serie',
    chart_serie_selection_y: 'Y ordinate values of the serie',
    series_name: 'Series\' name',
    serie_name: 'Serie\'s name',
    x_labels: 'Abscissa\'s names',
    multiple_series_data_wrong_format: 'Incorrect format. Example: A1:A2,B1:B2',
    single_serie_data_wrong_format: 'Incorrect format. Exemple: A1:B2',
    selection_out_of_bound: 'The selection is out of sheet bound',
    chart_data_selection_tooltip: 'Clic to select the cells',
    chart_data_range: 'Chart data range',
    chart_add_serie: 'Add serie',
    chart_update_serie: 'Update serie',
    chart_delete_serie: 'Delete serie',
    chart_serie_selection: 'Serie\'s selection',
    chart_serie: 'Serie',
    chart_series: 'Séries'

  }
};

export const flSpreadSheetI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flSpreadsheetI18nEn,
  [ClSupportedLanguage.fr]: flSpreadsheetI18nFr
};
