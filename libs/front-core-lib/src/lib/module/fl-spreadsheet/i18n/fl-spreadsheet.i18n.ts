import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flSpreadsheetI18nFr: FlLangTranslation = {
  flSpreadsheet: {
    add: 'Add',
    delete: 'Delete',
    create_chart: 'Créer un graphique',
    create_chart_validate: 'Valider',
    chart_type: 'Graphique',
    series_data_selection: 'Sélection des données',
    series_name: 'Noms des séries',
    x_labels: 'Labels des abscisses',
    multiple_series_data_wrong_format: 'Format incorrect. Exemple: A1:A2,B1:B2',
    single_serie_data_wrong_format: 'Format incorrect. Exemple: A1:B2',
    selection_out_of_bound: 'La sélection dépasse la taille du tableau',
    chart_data_selection_tooltip: 'Cliquez pour sélection les cellules',
    copy: 'Copier',
    paste: 'Coller'
  }
};

const flSpreadsheetI18nEn: FlLangTranslation = {
  flSpreadsheet: {
    add: 'Add',
    delete: 'Delete',
    create_chart: 'Create a chart',
    create_chart_validate: 'Validate',
    chart_type: 'Chart',
    series_data_selection: 'Data selection',
    series_name: 'Series\' name',
    x_labels: 'Abscissa\'s names',
    multiple_series_data_wrong_format: 'Incorrect format. Example: A1:A2,B1:B2',
    single_serie_data_wrong_format: 'Incorrect format. Exemple: A1:B2',
    selection_out_of_bound: 'The selection is out of sheet bound',
    chart_data_selection_tooltip: 'Clic to select the cells',
    copy: 'Copy',
    paste: 'Paste'
  }
};

export const flSpreadSheetI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flSpreadsheetI18nEn,
  [ClSupportedLanguage.fr]: flSpreadsheetI18nFr
};
