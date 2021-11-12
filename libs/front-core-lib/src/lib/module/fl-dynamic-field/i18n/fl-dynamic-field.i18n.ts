import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


const flDynamicFieldI18nFr: FlLangTranslation = {
  flDynamicField: {
    min_error_validator: 'The value must be higher or equal than {{min}}',
    max_error_validator: 'The value must be lower or equal than {{max}}',
    integer_error_validator: 'The value must be an integer',
    multi_input_help: 'Renseigner une valeur par ligne',
    add_value_in_array: 'Add a value',
    remove_value_from_array: 'Remove value',
    no_value_in_array: 'No value for this config',
    form_array_delete_disable: 'Can\'t delete, it needs at least {{value}} value(s)',
    form_array_add_disable: 'Can\'t add, it supports maximum {{value}} value(s)',
  }
};

const flDynamicFieldI18nEn: FlLangTranslation = {
  flDynamicField: {
    min_error_validator: 'La valeur doit être supérieur ou égal à {{min}}',
    max_error_validator: 'La valeur doit être inférieur ou égale à {{max}}',
    integer_error_validator: 'The value doit être un entier',
    multi_input_help: 'Specify one value per line',
    add_value_in_array: 'Ajouter une valeur',
    remove_value_from_array: 'Supprimer une valeur',
    no_value_in_array: 'Aucune valeur pour cette config',
    form_array_delete_disable: 'Suppression désactivée, le formulaire nécessite au moins  {{value}} valeur(s)',
    form_array_add_disable: 'Ajout désactivée, le formulaire support au maximum {{value}} valeur(s)',
  }
};

export const flDynamicFieldI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flDynamicFieldI18nEn,
  [ClSupportedLanguage.fr]: flDynamicFieldI18nFr
};
