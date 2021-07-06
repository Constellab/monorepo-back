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
    create_chart_validate: 'Valider',
    chart_selection_title: 'Sélectionner les données',
    create_chart: 'Créer le graphique',
    update_chart: 'Modifier le graphique',
    create_new_chart: 'Créer un nouveau graphique',
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
    chart_series: 'Séries',
    chart_nb_of_bins: 'Nombres de classes',
    chart_nb_of_bins_error: 'Le nombre de classes doit être un entier supérieur à 1',
    chart_update: 'Modifier les données'
  }
};

const flSpreadsheetI18nEn: FlLangTranslation = {
  flSpreadsheet: {
    add: 'Add',
    delete: 'Delete',
    copy: 'Copy',
    paste: 'Paste',
    create_chart_validate: 'Validate',
    chart_selection_title: 'Select data',
    create_chart: 'Create chart',
    update_chart: 'Update chart',
    create_new_chart: 'Create new chart',
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
    chart_series: 'Séries',
    chart_nb_of_bins: 'Number of classes',
    chart_nb_of_bins_error: 'The number of classes must be an integer higher than 1',
    chart_update: 'Update data'

  }
};

export const flSpreadSheetI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flSpreadsheetI18nEn,
  [ClSupportedLanguage.fr]: flSpreadsheetI18nFr
};
