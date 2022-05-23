import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';
import {ClSupportedLanguage} from '@monorepo/core-lib';

/**
 * Translation file for the Spreadsheet module
 */
const tdTechnicalDocI18nFr: FlLangTranslation = {
  td: {
    input: 'Entrée',
    output: 'Sortie',
    configuration: 'Configuration',
    type: 'Type',
    allowed_values: 'Valeurs autorisées',
    default_value: 'Valeur par défaut',
    parent: 'Parent',
    status: 'Etat',
    supported_extensions: 'Extensions supportées'
  }
};

const tdTechnicalDocI18nEn: FlLangTranslation = {
  td: {
    input: 'Input',
    output: 'Output',
    configuration: 'Configuration',
    type: 'Type',
    allowed_values: 'Allowed values',
    default_value: 'Default value',
    parent: 'Parent',
    status: 'Status',
    supported_extensions: 'Supported Extentions'
  }
};

export const tdTechnicalDocI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: tdTechnicalDocI18nEn,
  [ClSupportedLanguage.fr]: tdTechnicalDocI18nFr
};
