import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


const flDynamicFieldI18nFr: FlLangTranslation = {
  flDynamicField: {
    min_error_validator: 'Value must be higher or equal than {{min}}',
    max_error_validator: 'Value must be lower or equal than {{max}}',
    multi_input_help: 'Renseigner une valeur par ligne'
  }
};

const flDynamicFieldI18nEn: FlLangTranslation = {
  flDynamicField: {
    min_error_validator: 'La valeur doit être supérieur ou égal à {{min}}',
    max_error_validator: 'La valeur doit être inférieur ou égale à {{max}}',
    multi_input_help: 'Specify one value per line'
  }
};

export const flDynamicFieldI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flDynamicFieldI18nEn,
  [ClSupportedLanguage.fr]: flDynamicFieldI18nFr
};
