import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flTagI18nFr: FlLangTranslation = {
  flTag: {
    search_tag: 'Rechercher des tags',
    tags: 'Tags',
    input_helper_text: 'Appuyez sur \'Entrer\' ou \'Tab\' pour ajouter un nouveau tag',
    update_tags: 'Modifier les tags',
    no_tags: 'Aucun tag',
  }
};

const flTagI18nEn: FlLangTranslation = {
  flTag: {
    search_tag: 'Search tags',
    tags: 'Tags',
    input_helper_text: 'Press \'Enter\' or \'Tab\' to add a new tag',
    update_tags: 'Update tags',
    no_tags: 'No tags',
  }
};

export const flTagI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flTagI18nEn,
  [ClSupportedLanguage.fr]: flTagI18nFr
};
